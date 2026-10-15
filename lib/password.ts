import {
  createHash,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';
import bcrypt from 'bcryptjs';

const scrypt = promisify(nodeScrypt);
const KEY_LENGTH = 64;
const DUMMY_BCRYPT_HASH =
  '$2b$12$C6UzMDM.H6dfI/f/IKcEe.5O4/8OMj9z8R/oWngYTSPXp0lJ0fYea';
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;
const BCRYPT_SHA256_PREFIX = 'bcrypt-sha256$';

function prehashPassword(password: string): string {
  return createHash('sha256').update(password, 'utf8').digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
  return `${BCRYPT_SHA256_PREFIX}${await bcrypt.hash(prehashPassword(password), 12)}`;
}

export async function verifyPassword(
  password: string,
  encodedHash: string | null | undefined,
): Promise<boolean> {
  const [algorithm, saltHex, hashHex] = encodedHash?.split('$') ?? [];
  if (
    algorithm === 'scrypt' &&
    /^[0-9a-f]{32}$/i.test(saltHex ?? '') &&
    /^[0-9a-f]{128}$/i.test(hashHex ?? '')
  ) {
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const actual = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  if (encodedHash?.startsWith(BCRYPT_SHA256_PREFIX)) {
    const bcryptHash = encodedHash.slice(BCRYPT_SHA256_PREFIX.length);
    if (BCRYPT_HASH_PATTERN.test(bcryptHash)) {
      return bcrypt.compare(prehashPassword(password), bcryptHash);
    }
  }

  if (encodedHash && BCRYPT_HASH_PATTERN.test(encodedHash)) {
    return bcrypt.compare(password, encodedHash);
  }

  await bcrypt.compare(password, DUMMY_BCRYPT_HASH);
  return false;
}

export function needsPasswordUpgrade(encodedHash: string): boolean {
  return (
    encodedHash.startsWith('scrypt$') ||
    (BCRYPT_HASH_PATTERN.test(encodedHash) && !encodedHash.startsWith(BCRYPT_SHA256_PREFIX))
  );
}
