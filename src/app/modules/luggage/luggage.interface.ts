import { Document, Types } from "mongoose";

export interface ILuggage extends Document {
  order_id: Types.ObjectId | string;
  barcode_id: string;
  current_status: 'created' | 'scanned_inbound' | 'in_warehouse' | 'scanned_outbound' | 'delivered';
  batch_id?: Types.ObjectId | string;
  rack_id?: Types.ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}
