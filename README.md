# PS-15 — Layered Data Encryption

## 🔐 STRATA — Selective Disclosure for Financial Transactions

STRATA is a layered data encryption and selective disclosure system designed for multi-party financial transactions.

The goal is simple:

> Different users should only be able to access the information they actually need.

This reduces unnecessary exposure of sensitive financial data and follows a **need-to-know** security model.

---

## 🖥️ Two Applications — Two Ports

This project currently contains two separate web applications.

| Port | Application | Purpose |
|------|-------------|---------|
| 🟣 **3000** | **Main STRATA** | Main project application |
| 🔐 **4000** | **Encryption / Selective Disclosure Demo** | Demonstrates role-based field visibility and encryption |

### 🟣 Main STRATA — Port 3000

**URL:**

`http://localhost:3000`

Run:

```powershell
cd strata
$env:PORT=3000
npm start
