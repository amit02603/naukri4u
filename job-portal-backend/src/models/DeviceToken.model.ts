import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Device token document interface.
 */
export interface IDeviceToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  token: string;
  platform: 'android' | 'ios' | 'web';
  isActive: boolean;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DeviceTokens collection schema.
 *
 * Stores Firebase Cloud Messaging (FCM) device tokens for push notifications.
 * Architecture is ready for future FCM integration — tokens are stored
 * during login and deactivated on logout.
 *
 * A single user may have multiple device tokens (multiple devices).
 */
const deviceTokenSchema = new Schema<IDeviceToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Device token is required'],
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: {
        values: ['android', 'ios', 'web'],
        message: 'Platform must be one of: android, ios, web',
      },
      required: [true, 'Platform is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Find active tokens for a user (for sending push notifications)
deviceTokenSchema.index({ userId: 1, isActive: 1 });

export const DeviceToken = mongoose.model<IDeviceToken>('DeviceToken', deviceTokenSchema);
