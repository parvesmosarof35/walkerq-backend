import mongoose, { Document, Types } from "mongoose";

export interface IOrder extends Document {
  user_id: Types.ObjectId | string;
  flight_number: string;
  flight_time: Date;
  total_bags: number;
  payment_status: 'pending' | 'paid' | 'manual';
  payment_method: 'stripe' | 'paypal' | 'cash' | 'pos';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderResponse {
  status: boolean;
  message: string;
  data?: {
    order: IOrder;
  };
}

export interface OrderListResponse {
  status: boolean;
  message: string;
  data?: {
    orders: IOrder[];
    total: number;
    page: number;
    limit: number;
  };
}
