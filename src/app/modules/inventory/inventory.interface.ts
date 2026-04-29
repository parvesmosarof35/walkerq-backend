import { Document, Schema } from 'mongoose';

export interface IShelf extends Document {
  name: string;
  location: string;
  racks: Schema.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRack extends Document {
  shelfId: Schema.Types.ObjectId;
  name: string;
  capacity: number;
  current: number;
  color?: string;
  lightColor?: string;
  border?: string;
  createdAt?: Date;
  updatedAt?: Date;
}