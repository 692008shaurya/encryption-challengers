# 🔐 STRATA — Layered Data Encryption & Selective Disclosure

> **PS-15 — Layered Data Encryption**

STRATA is a security-focused system designed for **multi-party financial transactions** where different participants should only be able to access the information they actually need.

Instead of giving every user access to an entire decrypted transaction, STRATA uses **role-based selective disclosure** to control which sensitive fields can be revealed.

The system combines:

- 🔐 Field-level encryption
- 👥 Role-based access control
- 🎯 Selective disclosure
- 🛡️ Need-to-know data access
- 🔑 Authenticated encryption using AES-256-GCM
- 🚧 Planned Acra-based security infrastructure

---

# 🌐 Live Demo

## ⚠️ Important

The applications currently run locally on two different ports.

`localhost` addresses are **not accessible to someone viewing this GitHub repository from another computer**.

### Local development

| Application | Local URL | Purpose |
|---|---|---|
| 🟣 **Main STRATA** | `http://localhost:3000` | Main STRATA application |
| 🔐 **Encryption Demo** | `http://localhost:4000` | Demonstrates encryption and selective disclosure |

### Public demo

> 🚧 **Public deployment coming soon.**

Once deployed, the public URLs will be placed here:

**Main STRATA:**  
`[LIVE DEMO LINK — TO BE ADDED]`

**Encryption / Selective Disclosure Demo:**  
`[LIVE DEMO LINK — TO BE ADDED]`

---

# 🧠 What is STRATA?

STRATA is the **application and policy layer** of the project.

The main idea is:

> **A user should not receive sensitive information simply because the application has access to it.**

Instead, STRATA determines:

```text
Who is requesting the data?
          ↓
What role do they have?
          ↓
What information does that role need?
          ↓
Which encrypted fields are they allowed to access?
          ↓
Only authorized information is disclosed.
