import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const permissionSchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  resource: {
    type: String,
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
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
  }
}, {
  timestamps: true,
  versionKey: false
});

permissionSchema.index({ resource: 1, action: 1 }, { unique: true });

export type PermissionDocument = InferSchemaType<typeof permissionSchema>;
export const PermissionModel = mongoose.model('Permission', permissionSchema);