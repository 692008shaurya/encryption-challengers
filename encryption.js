/**
 * Field-level encryption module.
 * Mimics what Acra does internally: AES-256-GCM authenticated encryption,
 * one master key per "zone" (here, we keep it simple with a single master
 * key — in a real system each role/zone would have its own key).
 *
 * NOTE: For a hackathon demo, the master key is hardcoded below.
 * In a real deployment this would come from a secrets manager / env var
 * and never be committed to git.
 */

const crypto = require("crypto");

// 32 bytes = 256 bits, required for AES-256.
// Demo-only key — mention in your pitch that a real system would use
// Acra-style key zones + rotation instead of one static key.
const MASTER_KEY = Buffer.from(
  "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
  "hex"
).subarray(0, 32);

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // recommended IV length for GCM

/**
 * Encrypts a plaintext string. Returns a single base64 string containing
 * iv + authTag + ciphertext concatenated, so it's easy to store as one field.
 */
function encryptField(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(String(plaintext), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // Pack iv (12 bytes) + authTag (16 bytes) + ciphertext, then base64 it
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * Decrypts a base64 blob produced by encryptField().
 */
function decryptField(base64Blob) {
  const raw = Buffer.from(base64Blob, "base64");

  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + 16);
  const ciphertext = raw.subarray(IV_LENGTH + 16);

  const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}

module.exports = { encryptField, decryptField };

