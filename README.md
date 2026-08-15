# PS-15: Layered Data Encryption (No-Docker version)

Real AES-256-GCM field-level encryption with role-based selective disclosure —
implemented directly in Node.js, inspired by Acra's field-level encryption +
key-zone model.

## Setup (one time)

```bash
npm install
```

## Run

```bash
node server.js
```

Then open your browser to: **http://localhost:4000**

## What's happening under the hood

1. `seedData.js` encrypts `amount` and `counterparty_account` at startup using
   AES-256-GCM (`encryption.js`) — this simulates data "encrypted at rest."
2. `server.js` exposes `GET /transactions?role=auditor` or `?role=clerk`.
3. For each request, it checks `roleMatrix.js` to see which encrypted fields
   that role is allowed to see, decrypts only those, and marks the rest
   `***HIDDEN***` — this is the selective disclosure mechanism.
4. `frontend/index.html` is a simple UI to demo the difference live.

## Editing the policy

Everything about "who sees what" lives in `roleMatrix.js`. Add a role or
field there — no other files need touching for policy changes.

## Test via curl (optional)

```bash
curl "http://localhost:4000/transactions?role=auditor"
curl "http://localhost:4000/transactions?role=clerk"
```

## For the pitch

We designed our architecture around Acra's field-level encryption and
key-zone model (cossacklabs/acra), and implemented the core mechanism
directly in Node.js for this demo — AES-256-GCM authenticated encryption
per field, role-based decryption enforcement, zero-trust by default
(nothing is decrypted unless explicitly permitted for that role).
