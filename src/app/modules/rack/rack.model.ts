import { Schema, model } from 'mongoose';
import { IRack } from './rack.interface';

const RackSchema = new Schema<IRack>(
  {
    rack_code: {
      type: String,
      required: [true, 'Rack code is required'],
      unique: true,
    },
    distance_to_dock: {
      type: Number,
      required: [true, 'Distance to dock is required'],
    },
    is_occupied: {
      type: Boolean,
      default: false,
    },
    luggage_id: {
      type: Schema.Types.ObjectId,
      ref: 'luggages',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const RackModel = model<IRack>('racks', RackSchema);

export default RackModel;
