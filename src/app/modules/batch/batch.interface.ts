import { Document, Types } from "mongoose";

export interface IBatch extends Document {
  type: 'inbound' | 'outbound';
  batch_number?: number;
  status: 'pending' | 'loading' | 'transit' | 'completed' | 'admin_override_required';
  max_capacity: number;
  current_count: number;
  driver_id?: Types.ObjectId | string;
  flight_time?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
