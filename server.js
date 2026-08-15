const express = require("express");
const path = require("path");
const { decryptField } = require("./encryption");
const { ROLE_MATRIX, ENCRYPTED_FIELDS } = require("./roleMatrix");
const { transactions } = require("./seedData");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "frontend")));

/**
 * GET /transactions?role=auditor|clerk
 * Returns all transactions, decrypting only the fields the given role
 * is allowed to see. Disallowed encrypted fields are never even
 * attempted for decryption — they're just marked hidden.
 */
app.get("/transactions", (req, res) => {
  const role = (req.query.role || "").toLowerCase();
  const allowedFields = ROLE_MATRIX[role];

  if (!allowedFields) {
    return res.status(400).json({
      error: `Unknown role "${role}". Valid roles: ${Object.keys(ROLE_MATRIX).join(", ")}`,
    });
  }

  const result = transactions.map((tx) => {
    const output = {};
    for (const key of Object.keys(tx)) {
      if (!ENCRYPTED_FIELDS.includes(key)) {
        output[key] = tx[key]; // plaintext column, always visible
        continue;
      }
      if (allowedFields.includes(key)) {
        try {
          output[key] = decryptField(tx[key]);
        } catch (err) {
          output[key] = "DECRYPT_ERROR";
        }
      } else {
        output[key] = "***HIDDEN***";
      }
    }
    return output;
  });

  res.json({ role, transactions: result });
});

app.get("/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`\nServer running: http://localhost:${PORT}`);
  console.log(`Open the demo UI in your browser at that address.\n`);
});
