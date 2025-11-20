// Shared Hash Utilities
import * as crypto from 'crypto';

export class HashUtils {
  static generateId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hashString(str: string): string {
    return crypto.createHash('sha256').update(str).digest('hex');
  }
}
