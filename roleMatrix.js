// EDIT THIS FILE as your field/role policy evolves.
// This is the actual "selective disclosure" policy for the whole project.

// Which fields are stored encrypted (must match seedData.js)
const ENCRYPTED_FIELDS = ["amount", "counterparty_account"];

// Which roles can see which encrypted fields.
// reference_id and status are plaintext, so every role sees them automatically.
const ROLE_MATRIX = {
  auditor: ["amount", "counterparty_account"], // sees everything
  clerk: [], // sees only plaintext fields (reference_id, status)
  // add more roles here, e.g.:
  // compliance: ["amount"],
};

module.exports = { ROLE_MATRIX, ENCRYPTED_FIELDS };
