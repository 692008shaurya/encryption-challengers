# STRATA — Layered Data Encryption

> **PS-15 — Layered Data Encryption**

## 🚀 Live Demo

### 🌐 Main Application
**https://encryption-challengers.onrender.com/**

> This is the main application judges should use to interact with the project.

### 🔐 Disclosure / Backend Demo
**https://encryption-challengers-disclosure.onrender.com/**

> This demonstrates the selective-disclosure mechanism operating behind the main application.

### 💻 Source Code
**https://github.com/692008shaurya/encryption-challengers**

---

## Problem

Financial transactions can contain multiple types of sensitive information:

- Metadata
- Routing and amount
- Party identity
- Compliance and risk data

Different parties need different parts of this information.

Giving every trusted party access to the complete decrypted transaction exposes information they do not need.

STRATA follows a **need-to-know model** where access to one part of a transaction does not automatically expose the rest.

---

## Solution

STRATA divides transaction data into independent encryption layers and releases only the keys permitted for the user's role.

```text
Transaction
│
├── Metadata
├── Routing & Amount
├── Party Identity
└── Compliance & Risk
