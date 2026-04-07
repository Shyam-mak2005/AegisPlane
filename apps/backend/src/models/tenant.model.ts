import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const tenantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'disabled'],
    default: 'active',
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free',
    index: true
  },
  activeUserCount: {
    type: Number,
    default: 0
  },
  apiRequestCountToday: {
    type: Number,
    default: 0
  },
  featureOverrides: {
    type: Map,
    of: Boolean,
    default: {}
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  versionKey: false
});

tenantSchema.index({ createdAt: -1 });
tenantSchema.index({ status: 1, plan: 1 });

export type TenantDocument = InferSchemaType<typeof tenantSchema>;
export const TenantModel = mongoose.model('Tenant', tenantSchema);