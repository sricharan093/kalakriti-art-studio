import express from 'express';
import { getAllOrdersAdmin } from '../controllers/orderController.js';
import {
  getAllWallBookingsAdmin,
  confirmWallBooking,
  declineWallBooking
} from '../controllers/wallBookingController.js';
import {
  getAllPotteryRequestsAdmin,
  acceptPotteryRequest,
  declinePotteryRequest
} from '../controllers/potteryController.js';
import { getAdminStats } from '../controllers/statsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate, requireAdmin);

// Dashboard stats
router.get('/stats', getAdminStats);

// Orders
router.get('/orders', getAllOrdersAdmin);

// Wall Bookings
router.get('/wall-bookings', getAllWallBookingsAdmin);
router.patch('/wall-bookings/:id/confirm', confirmWallBooking);
router.patch('/wall-bookings/:id/decline', declineWallBooking);

// Pottery Requests
router.get('/pottery-requests', getAllPotteryRequestsAdmin);
router.patch('/pottery-requests/:id/accept', acceptPotteryRequest);
router.patch('/pottery-requests/:id/decline', declinePotteryRequest);

export default router;
