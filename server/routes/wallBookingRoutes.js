import express from 'express';
import {
  getWallPaintingRate,
  getBookedDates,
  createWallBooking,
  getMyWallBookings,
  cancelWallBooking
} from '../controllers/wallBookingController.js';
import { authenticate, requireCustomer } from '../middleware/auth.js';

const router = express.Router();

// Public routes for pricing info and checking booked dates
router.get('/rate', getWallPaintingRate);
router.get('/availability', getBookedDates);

// Customer-only routes
router.post('/', authenticate, requireCustomer, createWallBooking);
router.get('/my', authenticate, requireCustomer, getMyWallBookings);
router.patch('/:id/cancel', authenticate, requireCustomer, cancelWallBooking);

export default router;
