import { RefreshTokenModel } from '@/models/refresh-token.model.js';

export class SessionRepository {
  create(payload: Record<string, unknown>) {
    return RefreshTokenModel.create(payload);
  }

  findByTokenHash(tokenHash: string) {
    return RefreshTokenModel.findOne({ tokenHash });
  }

  revokeById(id: string, replacedByTokenId?: string) {
    return RefreshTokenModel.findByIdAndUpdate(id, {
      revokedAt: new Date(),
      ...(replacedByTokenId ? { replacedByTokenId } : {})
    }, { new: true });
  }

  revokeFamily(family: string) {
    return RefreshTokenModel.updateMany({ family, revokedAt: null }, { revokedAt: new Date() });
  }

  revokeSession(sessionId: string) {
    return RefreshTokenModel.updateMany({ sessionId, revokedAt: null }, { revokedAt: new Date() });
  }
}

export const sessionRepository = new SessionRepository();