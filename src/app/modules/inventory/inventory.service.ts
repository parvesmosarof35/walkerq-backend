import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ShelfModel, RackModel } from './inventory.model';
import { IShelf, IRack } from './inventory.interface';

const getAllInventory = async () => {
  const result = await ShelfModel.find().populate('racks');
  return result;
};

const createShelf = async (payload: Partial<IShelf>) => {
  const result = await ShelfModel.create(payload);
  return result;
};

const deleteShelf = async (shelfId: string) => {
  const shelf = await ShelfModel.findById(shelfId);
  if (!shelf) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shelf not found');
  }

  // Delete all associated racks
  await RackModel.deleteMany({ shelfId });

  // Delete the shelf
  const result = await ShelfModel.findByIdAndDelete(shelfId);
  return result;
};

const createRack = async (shelfId: string, payload: Partial<IRack>) => {
  const shelf = await ShelfModel.findById(shelfId);
  if (!shelf) {
    throw new AppError(httpStatus.NOT_FOUND, 'Shelf not found');
  }

  const rackData = { ...payload, shelfId };
  const rack = await RackModel.create(rackData);

  // Add the rack to the shelf's racks array
  await ShelfModel.findByIdAndUpdate(shelfId, {
    $push: { racks: rack._id },
  });

  return rack;
};

const deleteRack = async (shelfId: string, rackId: string) => {
  const rack = await RackModel.findOne({ _id: rackId, shelfId });
  if (!rack) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rack not found in the specified shelf');
  }

  // Remove the rack reference from the shelf
  await ShelfModel.findByIdAndUpdate(shelfId, {
    $pull: { racks: rackId },
  });

  // Delete the rack
  const result = await RackModel.findByIdAndDelete(rackId);
  return result;
};

const updateRack = async (rackId: string, payload: Partial<IRack>) => {
  const rack = await RackModel.findById(rackId);
  if (!rack) {
    throw new AppError(httpStatus.NOT_FOUND, 'Rack not found');
  }

  const updatedCapacity = payload.capacity !== undefined ? payload.capacity : rack.capacity;
  const updatedCurrent = payload.current !== undefined ? payload.current : rack.current;

  if (updatedCurrent > updatedCapacity) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Current luggage count cannot exceed capacity');
  }

  const result = await RackModel.findByIdAndUpdate(rackId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};

export const InventoryService = {
  getAllInventory,
  createShelf,
  deleteShelf,
  createRack,
  deleteRack,
  updateRack,
};
