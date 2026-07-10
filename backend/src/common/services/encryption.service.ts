import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32;
const VERSION = 'v1';

/**
 * AES-256-GCM encryption for secrets at rest (e.g. SMTP passwords).
 * Ciphertext format: v1:<salt>:<iv>:<authTag>:<ciphertext> (base64 segments).
 */
@Injectable()
export class EncryptionService {
  private getMasterSecret(): string {
    const secret =
      process.env.MAIL_ENCRYPTION_KEY?.trim() ||
      process.env.ENCRYPTION_KEY?.trim() ||
      process.env.JWT_SECRET?.trim();
    if (!secret || secret.length < 32) {
      throw new InternalServerErrorException(
        'MAIL_ENCRYPTION_KEY (or ENCRYPTION_KEY / JWT_SECRET) must be set and at least 32 characters. ' +
          'Add MAIL_ENCRYPTION_KEY to backend env (openssl rand -hex 32), then restart the API.',
      );
    }
    return secret;
  }

  encrypt(plaintext: string): string {
    if (!plaintext) {
      throw new Error('Cannot encrypt empty plaintext');
    }
    const salt = randomBytes(SALT_LENGTH);
    const key = scryptSync(this.getMasterSecret(), salt, KEY_LENGTH);
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return [
      VERSION,
      salt.toString('base64'),
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  decrypt(payload: string): string {
    const parts = payload.split(':');
    if (parts.length !== 5 || parts[0] !== VERSION) {
      throw new Error('Invalid encrypted payload format');
    }
    const [, saltB64, ivB64, tagB64, dataB64] = parts;
    const salt = Buffer.from(saltB64, 'base64');
    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const encrypted = Buffer.from(dataB64, 'base64');
    const key = scryptSync(this.getMasterSecret(), salt, KEY_LENGTH);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
