import mongoose, { Schema, model } from 'mongoose';
import { IOrder } from './order.interface';

const OrderSchema = new Schema<IOrder>(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: [true, 'User ID is required'],
    },
    flight_number: {
      type: String,
      required: [true, 'Flight number is required'],
    },
    flight_time: {
      type: Date,
      required: [true, 'Flight time is required'],
    },
    total_bags: {
      type: Number,
      required: [true, 'Total bags is required'],
    },
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'manual'],
      default: 'pending',
    },
    payment_method: {
      type: String,
      enum: ['stripe', 'paypal', 'cash', 'pos'],
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel = model<IOrder>('orders', OrderSchema);

export default OrderModel;
