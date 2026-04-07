import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '@/config/env.js';
import type { AuthContext } from '@/types/http.js';
import { createSecureToken, sha256 } from '@/shared/utils/crypto.js';
import { ttlToMilliseconds } from '@/shared/utils/time.js';

export class TokenService {
  signAccessToken(payload: AuthContext) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_TTL as SignOptions['expiresIn'] });
  }

  createRefreshToken() {
    const token = createSecureToken(48);
    return {
      raw: token,
      hash: sha256(token),
      expiresAt: new Date(Date.now() + ttlToMilliseconds(env.JWT_REFRESH_TTL))
    };
  }
}

export const tokenService = new TokenService();