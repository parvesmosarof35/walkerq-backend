import { Schema, model } from 'mongoose';
import { IShelf, IRack } from './inventory.interface';

const RackSchema = new Schema<IRack>(
  {
    shelfId: {
      type: Schema.Types.ObjectId,
      ref: 'Shelf',
      required: [true, 'Shelf ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Rack name is required'],
    },
    capacity: {
      type: Number,
      default: 6,
    },
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current cannot be less than 0'],
    },
    color: {
      type: String,
    },
    lightColor: {
      type: String,
    },
    border: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Add validation to ensure current <= capacity
RackSchema.pre('save', function (next) {
  if (this.current > this.capacity) {
    return next(new Error('Current luggage count cannot exceed capacity'));
  }
  next();
});

const ShelfSchema = new Schema<IShelf>(
  {
    name: {
      type: String,
      required: [true, 'Shelf name is required'],
    },
    location: {
      type: String,
      required: [true, 'Shelf location is required'],
    },
    racks: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Rack',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const RackModel = model<IRack>('Rack', RackSchema);
export const ShelfModel = model<IShelf>('Shelf', ShelfSchema);
