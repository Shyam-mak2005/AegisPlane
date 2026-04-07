import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
    default: null
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  passwordHash: {
    type: String,
    required: true,
    select: false
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'invited', 'disabled'],
    default: 'active',
    index: true
  },
  isPlatformAdmin: {
    type: Boolean,
    default: false,
    index: true
  },
  roleIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Role'
  }],
  lastLoginAt: {
    type: Date,
    default: null
  },
  disabledAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ tenantId: 1, email: 1 }, { unique: true });
userSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
userSchema.index({ isPlatformAdmin: 1, email: 1 });

export type UserDocument = InferSchemaType<typeof userSchema>;
export const UserModel = mongoose.model('User', userSchema);