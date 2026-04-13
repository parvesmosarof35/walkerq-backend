import { Request, Response } from 'express';
import User from '../user/user.model';
import Order from '../order/order.model';
import httpStatus from 'http-status';
import catchAsync from '../../utils/asyncCatch';
import sendResponse from '../../utils/sendResponse';

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
  try {
    // Get total orders count
    const totalOrders = await Order.countDocuments();
    
    // Get total customers count (users with user role)
    const totalCustomers = await User.countDocuments({ role: 'user' });
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user_id', 'fullname email');

    const stats = {
      summary: {
        totalOrders,
        totalCustomers,
      },
      recentOrders,
    };

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Dashboard stats retrieved successfully',
      data: stats,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error retrieving dashboard stats',
      data: (error as Error).message,
    });
  }
});

const getUserGrowth = catchAsync(async (req: Request, res: Response) => {
  try {
    const { year } = req.query;
    
    if (!year || isNaN(Number(year))) {
      return sendResponse(res, {
        statusCode: httpStatus.BAD_REQUEST,
        success: false,
        message: 'Valid year parameter is required',
        data: null,
      });
    }

    const targetYear = Number(year);
    const startDate = new Date(`${targetYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${targetYear}-12-31T23:59:59.999Z`);

    // Aggregate users by month for the specified year
    const monthlyUserGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' },
          },
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.month': 1 },
      },
    ]);

    // Initialize all months with 0 users
    const monthlyData = [
      { month: 'Jan', totalUsers: 0 },
      { month: 'Feb', totalUsers: 0 },
      { month: 'Mar', totalUsers: 0 },
      { month: 'Apr', totalUsers: 0 },
      { month: 'May', totalUsers: 0 },
      { month: 'Jun', totalUsers: 0 },
      { month: 'Jul', totalUsers: 0 },
      { month: 'Aug', totalUsers: 0 },
      { month: 'Sep', totalUsers: 0 },
      { month: 'Oct', totalUsers: 0 },
      { month: 'Nov', totalUsers: 0 },
      { month: 'Dec', totalUsers: 0 },
    ];

    // Map the aggregated data to the monthly data
    monthlyUserGrowth.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].totalUsers = item.totalUsers;
      }
    });

    const totalUsers = monthlyData.reduce((sum, item) => sum + item.totalUsers, 0);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'User growth data retrieved successfully',
      data: {
        year: targetYear,
        totalUsers,
        monthlyData,
      },
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error retrieving user growth data',
      data: (error as Error).message,
    });
  }
});

const getRecentOrders = catchAsync(async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('user_id', 'fullname email')
      .select('user_id payment_status createdAt total_bags flight_number');

    const formattedOrders = recentOrders.map(order => {
      const user = order.user_id as any;
      return {
        orderNumber: `#LUN-${String(order._id).slice(-3).toUpperCase()}`,
        customerName: user?.fullname || 'Unknown',
        paymentStatus: order.payment_status,
        date: order.createdAt?.toISOString().split('T')[0] || 'Unknown',
        totalBags: order.total_bags,
        flightNumber: order.flight_number
      };
    });

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Recent orders retrieved successfully',
      data: formattedOrders,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error retrieving recent orders',
      data: (error as Error).message,
    });
  }
});

const getRecentUsers = catchAsync(async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .select('fullname email createdAt')
      .lean();

    const formattedUsers = recentUsers.map((user: any) => ({
      name: user.fullname,
      email: user.email,
      registrationDate: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'Unknown'
    }));

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Recent users retrieved successfully',
      data: formattedUsers,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error retrieving recent users',
      data: (error as Error).message,
    });
  }
});

export const DashboardControllers = {
  getDashboardStats,
  getUserGrowth,
  getRecentOrders,
  getRecentUsers,
};