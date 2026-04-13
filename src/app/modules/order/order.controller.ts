import { Request, Response } from 'express';
import OrderService from './order.service';
import OrderValidationSchemas from './order.validation';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/asyncCatch';

class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = catchAsync(async (req: Request, res: Response) => {
    const validatedData = OrderValidationSchemas.createOrderSchema.parse(req);
    const result = await this.orderService.createOrder(validatedData.body);

    if (result.status) {
      sendResponse(res, {
        statusCode: 201,
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.message,
        data: null,
      });
    }
  });

  getOrderById = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const result = await this.orderService.getOrderById(orderId);

    if (result.status) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 404,
        success: false,
        message: result.message,
        data: null,
      });
    }
  });

  getOrdersByCustomerId = catchAsync(async (req: Request, res: Response) => {
    const { customerId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const result = await this.orderService.getOrdersByCustomerId(
      customerId,
      Number(page),
      Number(limit)
    );

    if (result.status) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.message,
        data: null,
      });
    }
  });

  getAllOrders = catchAsync(async (req: Request, res: Response) => {
    const validatedData = OrderValidationSchemas.getOrderListSchema.parse(req);
    const { page, limit, payment_status } = validatedData.query as any;
    
    const result = await this.orderService.getAllOrders(page, limit, undefined, payment_status);

    if (result.status) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.message,
        data: null,
      });
    }
  });

  updatePaymentStatus = catchAsync(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { payment_status } = req.body;
    
    const result = await this.orderService.updatePaymentStatus(
      orderId,
      payment_status
    );

    if (result.status) {
      sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      sendResponse(res, {
        statusCode: 400,
        success: false,
        message: result.message,
        data: null,
      });
    }
  });

  updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order status update not yet implemented in Luggage System",
      data: null,
    });
  });

  cancelOrder = catchAsync(async (req: Request, res: Response) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Order cancellation not yet implemented in Luggage System",
      data: null,
    });
  });
}

export default new OrderController();
