import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const featureFlagSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    default: ''
  },
  enabledByDefault: {
    type: Boolean,
    default: false
  },
  rolloutPercentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  plansEnabled: {
    type: [String],
    enum: ['free', 'pro', 'enterprise'],
    default: ['enterprise']
  },
  tenantOverrides: [{
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true
    },
    enabled: {
      type: Boolean,
      required: true
    }
  }]
}, {
  timestamps: true,
  versionKey: false
});

featureFlagSchema.index({ plansEnabled: 1 });
featureFlagSchema.index({ updatedAt: -1 });

export type FeatureFlagDocument = InferSchemaType<typeof featureFlagSchema>;
export const FeatureFlagModel = mongoose.model('FeatureFlag', featureFlagSchema);