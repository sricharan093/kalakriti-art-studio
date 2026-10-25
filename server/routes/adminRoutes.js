import express from 'express';
import { getAllOrdersAdmin } from '../controllers/orderController.js';
import {
  getAllWallBookingsAdmin,
  confirmWallBooking,
  declineWallBooking,
  getMuralRateAdmin,
  updateMuralRateAdmin
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

// Studio Settings & Mural Pricing
router.get('/settings/mural-rate', getMuralRateAdmin);
router.put('/settings/mural-rate', updateMuralRateAdmin);
router.patch('/settings/mural-rate', updateMuralRateAdmin);
router.get('/wall-bookings/rate', getMuralRateAdmin);
router.put('/wall-bookings/rate', updateMuralRateAdmin);

// Pottery Requests
router.get('/pottery-requests', getAllPotteryRequestsAdmin);
router.patch('/pottery-requests/:id/accept', acceptPotteryRequest);
router.patch('/pottery-requests/:id/decline', declinePotteryRequest);

export default router;
