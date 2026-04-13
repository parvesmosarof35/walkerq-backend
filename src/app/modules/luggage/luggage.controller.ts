import { Request, Response } from 'express';
import LuggageService from './luggage.service';
import catchAsync from '../../utils/asyncCatch';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

class LuggageController {
  /**
   * Admin/Warehouse Staff: Automatically allocate a smart rack for luggage
   */
  allocateSmartRack = catchAsync(async (req: Request, res: Response) => {
    const { luggageId } = req.params;
    const result = await LuggageService.allocateSmartRack(luggageId);
    
    sendResponse(res, {
      success: result.status,
      statusCode: result.status ? httpStatus.OK : httpStatus.BAD_REQUEST,
      message: result.message,
      data: result.data || null,
    });
  });

  /**
   * User/Admin: Track luggage real-time location and status
   */
  trackLuggage = catchAsync(async (req: Request, res: Response) => {
    const { luggageId } = req.params;
    const result = await LuggageService.trackLuggageLocation(luggageId);
    
    sendResponse(res, {
      success: result.status,
      statusCode: httpStatus.OK,
      message: result.message,
      data: result.data || null,
    });
  });
}

export default new LuggageController();
