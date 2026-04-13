import { Document, Schema } from "mongoose";

export interface IRack extends Document {
  rack_code: string;
  distance_to_dock: number;
  is_occupied: boolean;
  luggage_id?: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
