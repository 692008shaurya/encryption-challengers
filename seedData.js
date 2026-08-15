/**
 * In-memory "database" of transactions.
 * Sensitive fields are encrypted the moment the server starts,
 * simulating data that's "at rest" in encrypted form —
 * exactly like Acra encrypting columns before they hit Postgres.
 */

const { encryptField } = require("./encryption");

const rawTransactions = [
  {
    id: 1,
    reference_id: "TXN-1001",
    status: "completed",
    amount: "45000",
    counterparty_account: "HDFC0001234-9988776655",
  },
  {
    id: 2,
    reference_id: "TXN-1002",
    status: "pending",
    amount: "12000",
    counterparty_account: "ICIC0005678-1122334455",
  },
  {
    id: 3,
    reference_id: "TXN-1003",
    status: "completed",
    amount: "980000",
    counterparty_account: "SBIN0009999-5566778899",
  },
];

// Encrypt sensitive fields once at startup — this is our "encrypted at rest" store
const transactions = rawTransactions.map((tx) => ({
  id: tx.id,
  reference_id: tx.reference_id,
  status: tx.status,
  amount: encryptField(tx.amount), // now stored as ciphertext
  counterparty_account: encryptField(tx.counterparty_account), // ciphertext
}));

module.exports = { transactions };
