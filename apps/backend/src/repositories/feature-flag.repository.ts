import { FeatureFlagModel } from '@/models/feature-flag.model.js';

export class FeatureFlagRepository {
  list() {
    return FeatureFlagModel.find({}).sort({ key: 1 }).lean();
  }

  findByKey(key: string) {
    return FeatureFlagModel.findOne({ key }).lean();
  }

  update(key: string, payload: Record<string, unknown>) {
    return FeatureFlagModel.findOneAndUpdate({ key }, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }).lean();
  }
}

export const featureFlagRepository = new FeatureFlagRepository();