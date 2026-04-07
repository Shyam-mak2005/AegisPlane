import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const subscriptionSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
    index: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'canceled'],
    default: 'active',
    index: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  seats: {
    type: Number,
    default: 5
  },
  apiRateLimitPerMinute: {
    type: Number,
    required: true
  },
  enabledFeatures: {
    type: [String],
    default: []
  },
  currentPeriodStart: {
    type: Date,
    default: Date.now
  },
  currentPeriodEnd: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  usageSnapshot: {
    users: { type: Number, default: 0 },
    apiRequestsToday: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  versionKey: false
});

subscriptionSchema.index({ status: 1, currentPeriodEnd: 1 });

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;
export const SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);