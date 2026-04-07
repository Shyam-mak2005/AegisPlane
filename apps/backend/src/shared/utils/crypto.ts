import { createHash, randomBytes } from 'crypto';

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');
export const createSecureToken = (size = 48) => randomBytes(size).toString('hex');