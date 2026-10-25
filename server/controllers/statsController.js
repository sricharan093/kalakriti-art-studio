import { Order } from '../models/Order.js';
import { WallBooking } from '../models/WallBooking.js';
import { PotteryRequest } from '../models/PotteryRequest.js';
import { Painting } from '../models/Painting.js';
import { User } from '../models/User.js';

export const getCustomerStats = async (req, res, next) => {
  try {
    const customerId = req.user._id;

    const [orderCount, bookingCount, potteryCount, recentOrders, recentBookings] = await Promise.all([
      Order.countDocuments({ customer: customerId }),
      WallBooking.countDocuments({ customer: customerId }),
      PotteryRequest.countDocuments({ customer: customerId }),
      Order.find({ customer: customerId }).populate('painting', 'title price imageUrl').sort({ createdAt: -1 }).limit(3),
      WallBooking.find({ customer: customerId }).sort({ bookingDate: 1 }).limit(3)
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders: orderCount,
        totalBookings: bookingCount,
        totalPotteryRequests: potteryCount
      },
      recentOrders,
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalCustomers,
      paintingsAvailable,
      paintingsSold,
      paintingsArchived,
      totalPaintings,
      totalOrders,
      wallBookingsRequested,
      wallBookingsConfirmed,
      wallBookingsDeclined,
      potteryRequested,
      potteryAccepted,
      potteryDeclined,
      recentOrders,
      recentWallBookings,
      recentPotteryRequests,
      recentPaintings
    ] = await Promise.all([
      User.countDocuments({ role: 'CUSTOMER' }),
      Painting.countDocuments({ status: 'available', isArchived: { $ne: true } }),
      Painting.countDocuments({ status: 'sold', isArchived: { $ne: true } }),
      Painting.countDocuments({ $or: [{ status: 'archived' }, { isArchived: true }] }),
      Painting.countDocuments(),
      Order.countDocuments(),
      WallBooking.countDocuments({ status: 'requested' }),
      WallBooking.countDocuments({ status: 'confirmed' }),
      WallBooking.countDocuments({ status: 'declined' }),
      PotteryRequest.countDocuments({ status: 'requested' }),
      PotteryRequest.countDocuments({ status: 'accepted' }),
      PotteryRequest.countDocuments({ status: 'declined' }),
      Order.find()
        .populate('customer', 'name email phone')
        .populate('painting', 'id title price imageUrl status')
        .sort({ createdAt: -1 })
        .limit(5),
      WallBooking.find()
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(5),
      PotteryRequest.find()
        .populate('customer', 'name email phone')
        .sort({ createdAt: -1 })
        .limit(5),
      Painting.find()
        .sort({ createdAt: -1 })
        .limit(6)
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalCustomers,
        paintingsAvailable,
        paintingsSold,
        paintingsArchived,
        totalPaintings,
        totalOrders,
        wallBookingsRequested,
        wallBookingsConfirmed,
        wallBookingsDeclined,
        potteryRequested,
        potteryAccepted,
        potteryDeclined
      },
      recentOrders,
      recentWallBookings,
      recentPotteryRequests,
      recentPaintings
    });
  } catch (error) {
    next(error);
  }
};
