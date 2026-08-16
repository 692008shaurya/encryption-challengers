# STRATA — Layered Data Encryption

> **PS-15 — Layered Data Encryption**

STRATA is a cybersecurity prototype for **selective disclosure of sensitive transaction data**.

Instead of giving every trusted party access to an entire decrypted transaction, STRATA divides transaction data into independent encryption layers and releases only the keys required by the user's role.

---

## Problem

Financial transactions can contain multiple types of sensitive information:

- Metadata
- Routing and amount
- Party identity
- Compliance and risk data

Different parties need different parts of this information.

STRATA follows a **need-to-know model** where access to one part of a transaction does not automatically expose the rest.

---

## Solution

Each transaction is protected using multiple encryption layers.

```text
Transaction
│
├── Metadata
├── Routing & Amount
├── Party Identity
└── Compliance & Risk
