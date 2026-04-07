import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const roleSchema = new Schema({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    index: true,
    default: null
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  scope: {
    type: String,
    enum: ['platform', 'tenant'],
    default: 'tenant',
    index: true
  },
  isSystemRole: {
    type: Boolean,
    default: false
  },
  permissionKeys: {
    type: [String],
    default: []
  }
}, {
  timestamps: true,
  versionKey: false
});

roleSchema.index({ tenantId: 1, name: 1 }, { unique: true });
roleSchema.index({ scope: 1, updatedAt: -1 });

export type RoleDocument = InferSchemaType<typeof roleSchema>;
export const RoleModel = mongoose.model('Role', roleSchema);