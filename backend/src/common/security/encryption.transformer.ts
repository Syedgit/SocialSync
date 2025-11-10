import { ValueTransformer } from 'typeorm';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit nonce recommended for GCM
const AUTH_TAG_LENGTH = 16;

function resolveKey(): Buffer {
  const rawKey = process.env.ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error(
      'ENCRYPTION_KEY is not set. Please provide a 32-byte key encoded as base64 or hex.',
    );
  }

  // Try base64 first, then hex
  let key: Buffer | null = null;
  try {
    const base64 = Buffer.from(rawKey, 'base64');
    if (base64.length === 32) {
      key = base64;
    }
  } catch {
    key = null;
  }

  if (!key) {
    try {
      const hex = Buffer.from(rawKey, 'hex');
      if (hex.length === 32) {
        key = hex;
      }
    } catch {
      key = null;
    }
  }

  if (!key || key.length !== 32) {
    throw new Error(
      'ENCRYPTION_KEY must decode to 32 bytes. Provide a 32-byte key encoded as base64 or hex.',
    );
  }

  return key;
}

let cachedKey: Buffer | null = null;
function getKey(): Buffer {
  if (!cachedKey) {
    cachedKey = resolveKey();
  }
  return cachedKey;
}

export class EncryptionTransformer implements ValueTransformer {
  to(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }

    const key = getKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    const payload = Buffer.concat([iv, authTag, encrypted]).toString('base64');
    return payload;
  }

  from(value: string | null): string | null {
    if (value === null || value === undefined) {
      return value;
    }

    try {
      const key = getKey();
      const payload = Buffer.from(value, 'base64');
      if (payload.length < IV_LENGTH + AUTH_TAG_LENGTH) {
        // Likely not encrypted payload, return as-is
        return value;
      }

      const iv = payload.subarray(0, IV_LENGTH);
      const authTag = payload.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
      const ciphertext = payload.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
      return decrypted.toString('utf8');
    } catch (error) {
      // Decryption failed, assume legacy plaintext and return it
      return value;
    }
  }
}

export const encryptionTransformer = new EncryptionTransformer();

