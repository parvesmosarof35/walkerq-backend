import mongoose, { Schema, model } from 'mongoose';
import { ILuggage } from './luggage.interface';

const LuggageSchema = new Schema<ILuggage>(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'orders',
      required: [true, 'Order ID is required'],
    },
    barcode_id: {
      type: String,
      required: [true, 'Barcode ID is required'],
      unique: true,
    },
    current_status: {
      type: String,
      enum: ['created', 'scanned_inbound', 'in_warehouse', 'scanned_outbound', 'delivered'],
      default: 'created',
    },
    batch_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'batches',
    },
    rack_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'racks',
    },
  },
  {
    timestamps: true,
  }
);

const LuggageModel = model<ILuggage>('luggages', LuggageSchema);

export default LuggageModel;
