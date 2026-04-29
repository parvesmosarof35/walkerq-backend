import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/asyncCatch';
import sendResponse from '../../utils/sendResponse';
import { InventoryService } from './inventory.service';

const getAllInventory = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.getAllInventory();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Inventory retrieved successfully',
    data: result,
  });
});

const createShelf = catchAsync(async (req: Request, res: Response) => {
  const result = await InventoryService.createShelf(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Shelf created successfully',
    data: result,
  });
});

const deleteShelf = catchAsync(async (req: Request, res: Response) => {
  const { shelfId } = req.params;
  const result = await InventoryService.deleteShelf(shelfId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Shelf deleted successfully',
    data: result,
  });
});

const createRack = catchAsync(async (req: Request, res: Response) => {
  const { shelfId } = req.params;
  const result = await InventoryService.createRack(shelfId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Rack created successfully',
    data: result,
  });
});

const deleteRack = catchAsync(async (req: Request, res: Response) => {
  const { shelfId, rackId } = req.params;
  const result = await InventoryService.deleteRack(shelfId, rackId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rack deleted successfully',
    data: result,
  });
});

const updateRack = catchAsync(async (req: Request, res: Response) => {
  const { rackId } = req.params;
  const result = await InventoryService.updateRack(rackId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Rack updated successfully',
    data: result,
  });
});

export const InventoryController = {
  getAllInventory,
  createShelf,
  deleteShelf,
  createRack,
  deleteRack,
  updateRack,
};
