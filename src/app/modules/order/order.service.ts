import { IOrder, OrderResponse, OrderListResponse } from './order.interface';
import OrderModel from './order.model';
import BatchServices from '../batch/batch.service';

class OrderService {
  async createOrder(orderData: Partial<IOrder>): Promise<OrderResponse> {
    try {
      const order = await OrderModel.create(orderData);

      // Trigger batching logic automatically after order creation
      await BatchServices.assignBagsToBatch(order._id.toString());

      return {
        status: true,
        message: 'Order created and bags assigned to batch successfully',
        data: { order: order },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to create order',
      };
    }
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const order = await OrderModel.findById(orderId);

      if (!order) {
        return {
          status: false,
          message: 'Order not found',
        };
      }

      return {
        status: true,
        message: 'Order retrieved successfully',
        data: { order },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to retrieve order',
      };
    }
  }

  async getOrdersByCustomerId(userId: string, page: number = 1, limit: number = 10): Promise<OrderListResponse> {
    try {
      const startIndex = (page - 1) * limit;

      const [customerOrders, total] = await Promise.all([
        OrderModel.find({ user_id: userId })
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit),
        OrderModel.countDocuments({ user_id: userId }),
      ]);

      return {
        status: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: customerOrders,
          total,
          page,
          limit,
        },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to retrieve orders',
      };
    }
  }

  async getAllOrders(page: number = 1, limit: number = 10, status?: string, paymentStatus?: string): Promise<OrderListResponse> {
    try {
      const filter: Record<string, unknown> = {};
      if (paymentStatus) filter.payment_status = paymentStatus;

      const startIndex = (page - 1) * limit;

      const [ordersList, total] = await Promise.all([
        OrderModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(startIndex)
          .limit(limit),
        OrderModel.countDocuments(filter),
      ]);

      return {
        status: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: ordersList,
          total,
          page,
          limit,
        },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to retrieve orders',
      };
    }
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string): Promise<OrderResponse> {
    try {
      const order = await OrderModel.findByIdAndUpdate(
        orderId,
        { payment_status: paymentStatus as any },
        { new: true }
      );

      if (!order) {
        return {
          status: false,
          message: 'Order not found',
        };
      }

      return {
        status: true,
        message: 'Payment status updated successfully',
        data: { order },
      };
    } catch (error: any) {
      return {
        status: false,
        message: error.message || 'Failed to update payment status',
      };
    }
  }
}

export default OrderService;