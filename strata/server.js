// STRATA backend - real per-layer AES-256-GCM encryption with role-scoped
// key disclosure and an audit trail. In-memory only: perfect for a demo,
// swap the Maps for a real DB/KMS before production.

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MASTER_SECRET = crypto.randomBytes(32);

function deriveLayerKey(txnId, layerKey) {
  return crypto.createHmac('sha256', MASTER_SECRET)
    .update(txnId + ':' + layerKey)
    .digest();
}

function encryptLayer(txnId, layerKey, plaintextObj) {
  const key = deriveLayerKey(txnId, layerKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.from(JSON.stringify(plaintextObj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(data), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    iv: iv.toString('base64'),
    ciphertext: ciphertext.toString('base64'),
    tag: tag.toString('base64'),
  };
}

const LAYERS = ['meta', 'routing', 'identity', 'compliance'];

const ACCESS = {
  customer:  ['meta', 'routing'],
  bank:      ['meta', 'routing', 'identity'],
  auditor:   ['meta', 'identity', 'compliance'],
  regulator: ['meta', 'routing', 'identity', 'compliance'],
};

const USERS = {
  customer:  { password: 'customer123',  role: 'customer'  },
  bank:      { password: 'bank123',      role: 'bank'      },
  auditor:   { password: 'auditor123',   role: 'auditor'   },
  regulator: { password: 'regulator123', role: 'regulator' },
};

const SESSIONS = new Map();

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const session = token && SESSIONS.get(token);
  if (!session) return res.status(401).json({ error: 'Not authenticated' });
  req.session = session;
  next();
}

const RAW_TXNS = [
  {
    id: 'TXN-88213',
    meta: { time: '2026-08-16 02:01', status: 'SETTLED' },
    routing: { amount: 'Rs 4,82,000', currency: 'INR', route: 'HDFC to ICICI' },
    identity: { sender: 'A. Verma', receiver: 'Nairang Traders', account: '9981667743' },
    compliance: { kyc: 'KYC-90211', purpose: 'B2B Invoice #4471', risk: 'Low (12)' },
  },
  {
    id: 'TXN-88214',
    meta: { time: '2026-08-16 02:14', status: 'PENDING' },
    routing: { amount: '$12,300', currency: 'USD', route: 'Citi to DBS SG' },
    identity: { sender: 'Meridian Freight LLC', receiver: 'Orca Logistics Pte', account: '5502212290' },
    compliance: { kyc: 'KYC-55810', purpose: 'Freight Settlement', risk: 'Medium (46)' },
  },
  {
    id: 'TXN-88215',
    meta: { time: '2026-08-16 02:22', status: 'FLAGGED' },
    routing: { amount: 'EUR 9,750', currency: 'EUR', route: 'Deutsche to Revolut' },
    identity: { sender: 'Halvorsen Consulting', receiver: 'K. Oyelaran', account: '7743390087' },
    compliance: { kyc: 'KYC-71120', purpose: 'Consulting Fee', risk: 'High (81)' },
  },
];

const VAULT = new Map();
for (const txn of RAW_TXNS) {
  const layers = new Map();
  for (const layerKey of LAYERS) {
    layers.set(layerKey, encryptLayer(txn.id, layerKey, txn[layerKey]));
  }
  VAULT.set(txn.id, layers);
}

const AUDIT_LOG = [];

function logAudit(entry) {
  AUDIT_LOG.unshift(Object.assign({}, entry, { ts: new Date().toISOString() }));
  if (AUDIT_LOG.length > 200) AUDIT_LOG.pop();
}

app.post('/api/login', (req, res) => {
  const body = req.body || {};
  const username = body.username;
  const password = body.password;
  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = crypto.randomBytes(24).toString('hex');
  SESSIONS.set(token, { role: user.role, username: username });
  logAudit({ event: 'login', role: user.role, username: username });
  res.json({ token: token, role: user.role });
});

app.get('/api/transactions', (req, res) => {
  res.json(RAW_TXNS.map(t => ({
    id: t.id,
    status: t.meta.status,
    time: t.meta.time,
  })));
});

app.get('/api/transactions/:id/ciphertext', requireAuth, (req, res) => {
  const layers = VAULT.get(req.params.id);
  if (!layers) return res.status(404).json({ error: 'Not found' });
  const out = {};
  for (const entry of layers.entries()) out[entry[0]] = entry[1];
  res.json({ id: req.params.id, layers: out });
});

app.get('/api/transactions/:id/keys', requireAuth, (req, res) => {
  const role = req.session.role;
  const username = req.session.username;
  if (!VAULT.has(req.params.id)) return res.status(404).json({ error: 'Not found' });

  const allowed = ACCESS[role] || [];
  const keys = {};
  for (const layerKey of allowed) {
    keys[layerKey] = deriveLayerKey(req.params.id, layerKey).toString('base64');
  }

  logAudit({
    event: 'disclose',
    role: role,
    username: username,
    txnId: req.params.id,
    layersRevealed: allowed,
    layersWithheld: LAYERS.filter(l => allowed.indexOf(l) === -1),
  });

  res.json({ id: req.params.id, allowedLayers: allowed, keys: keys });
});

app.get('/api/audit', (req, res) => {
  res.json(AUDIT_LOG.slice(0, 50));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log('STRATA running:');
  console.log('  local:   http://localhost:' + PORT);
  console.log('  network: http://<your-ip>:' + PORT + '  (for other devices on same wifi)');
});
