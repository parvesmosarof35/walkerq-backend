import { Schema, model } from 'mongoose';
import { IBatch } from './batch.interface';

const BatchSchema = new Schema<IBatch>(
  {
    type: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: [true, 'Batch type is required'],
    },
    batch_number: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['pending', 'loading', 'transit', 'completed', 'admin_override_required'],
      default: 'pending',
    },
    max_capacity: {
      type: Number,
      default: 120,
    },
    current_count: {
      type: Number,
      default: 0,
    },
    flight_time: {
      type: Date,
    },
    driver_id: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    },
  },
  {
    timestamps: true,
  }
);

const BatchModel = model<IBatch>('batches', BatchSchema);

export default BatchModel;
