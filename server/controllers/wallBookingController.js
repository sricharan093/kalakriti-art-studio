import mongoose from 'mongoose';
import { WallBooking } from '../models/WallBooking.js';
import { StudioMeta } from '../models/StudioMeta.js';
import {
  createWallBookingSchema,
  getDaysFromToday,
  SUPPORTED_MURAL_DESIGNS,
  updateMuralRateSchema
} from '../validators/wallBookingValidator.js';

const DEFAULT_MURAL_RATE = 150;

export const getWallPaintingRate = async (req, res, next) => {
  try {
    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const rate = meta?.muralRatePerSqFt || DEFAULT_MURAL_RATE;
    return res.status(200).json({
      success: true,
      ratePerSqFt: rate,
      currency: meta?.currency || 'INR'
    });
  } catch (error) {
    next(error);
  }
};

export const getMuralDesigns = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      designs: SUPPORTED_MURAL_DESIGNS
    });
  } catch (error) {
    next(error);
  }
};

export const getBookedDates = async (req, res, next) => {
  try {
    // Return all booked dates. Under the conservative assignment rule,
    // all reserved dates are retained.
    const bookings = await WallBooking.find({}, 'bookingDate status');
    const bookedDates = bookings.map((b) => ({
      date: b.bookingDate,
      status: b.status
    }));

    return res.status(200).json({
      success: true,
      bookedDates
    });
  } catch (error) {
    next(error);
  }
};

export const createWallBooking = async (req, res, next) => {
  try {
    const validatedData = createWallBookingSchema.parse(req.body);

    // Resolve mural design
    const designId = validatedData.designId || req.body.designId || 'traditional-warli';
    const designObj = SUPPORTED_MURAL_DESIGNS.find((d) => d.id === designId);
    if (!designObj) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or unsupported mural design selected'
      });
    }

    // Look up current official studio mural rate
    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const appliedRate = meta?.muralRatePerSqFt || DEFAULT_MURAL_RATE;
    const totalPrice = validatedData.wallSize * appliedRate;

    // Check if date is already booked before attempting insert
    const existing = await WallBooking.findOne({ bookingDate: validatedData.bookingDate });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Date ${validatedData.bookingDate} is already reserved. Please select another date.`
      });
    }

    const booking = new WallBooking({
      customer: req.user._id,
      bookingDate: validatedData.bookingDate,
      address: validatedData.address,
      wallSize: validatedData.wallSize,
      appliedRate,
      totalPrice,
      selectedDesign: {
        id: designObj.id,
        name: designObj.name,
        previewImage: designObj.previewImage
      },
      status: 'requested'
    });

    await booking.save();

    // If customer explicitly requested to save address as default in Personal Space
    if (req.body.saveAsDefault) {
      const { User } = await import('../models/User.js');
      if (req.body.defaultAddress && typeof req.body.defaultAddress === 'object') {
        const addr = req.body.defaultAddress;
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            defaultAddress: {
              fullName: addr.fullName || req.user.name,
              phone: addr.phone || req.user.phone || '',
              streetAddress: addr.streetAddress || validatedData.address,
              addressLine2: addr.addressLine2 || '',
              city: addr.city || '',
              state: addr.state || '',
              postalCode: addr.postalCode || ''
            }
          }
        });
      } else {
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            'defaultAddress.streetAddress': validatedData.address
          }
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Wall painting request submitted successfully!',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getMyWallBookings = async (req, res, next) => {
  try {
    const bookings = await WallBooking.find({ customer: req.user._id }).sort({ bookingDate: 1 });
    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

export const cancelWallBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = await WallBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ownership check: If not owned by this customer -> 404
    if (booking.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Status check
    if (booking.status === 'cancelled' || booking.status === 'declined') {
      return res.status(400).json({
        success: false,
        message: `Booking is already ${booking.status} and cannot be cancelled.`
      });
    }

    // Rule: Cancellation only until 3 days before scheduled date
    const daysUntilBooking = getDaysFromToday(booking.bookingDate);
    if (daysUntilBooking < 3) {
      return res.status(400).json({
        success: false,
        message: 'Bookings can only be cancelled at least 3 days before the scheduled date.'
      });
    }

    booking.status = 'cancelled';
    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

export const getAllWallBookingsAdmin = async (req, res, next) => {
  try {
    const bookings = await WallBooking.find()
      .populate('customer', 'name email')
      .sort({ bookingDate: 1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

export const updateWallBookingStatusAdmin = (newStatus) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      const booking = await WallBooking.findById(id);
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }

      if (booking.status !== 'requested') {
        return res.status(400).json({
          success: false,
          message: `Cannot transition booking from '${booking.status}' to '${newStatus}'. Only 'requested' bookings can be confirmed or declined.`
        });
      }

      booking.status = newStatus;
      await booking.save();

      return res.status(200).json({
        success: true,
        message: `Booking has been ${newStatus}.`,
        booking
      });
    } catch (error) {
      next(error);
    }
  };
};

export const confirmWallBooking = updateWallBookingStatusAdmin('confirmed');
export const declineWallBooking = updateWallBookingStatusAdmin('declined');

export const getMuralRateAdmin = async (req, res, next) => {
  try {
    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const rate = meta?.muralRatePerSqFt || DEFAULT_MURAL_RATE;
    return res.status(200).json({
      success: true,
      ratePerSqFt: rate,
      currency: meta?.currency || 'INR'
    });
  } catch (error) {
    next(error);
  }
};

export const updateMuralRateAdmin = async (req, res, next) => {
  try {
    let { rate } = req.body;
    if (typeof rate === 'string') {
      rate = Number(rate);
    }
    const validated = updateMuralRateSchema.parse({ rate });

    const meta = await StudioMeta.findOneAndUpdate(
      { key: 'studio_config' },
      { $set: { muralRatePerSqFt: validated.rate } },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: `Mural rate updated to ₹${validated.rate} per sq.ft successfully.`,
      ratePerSqFt: meta.muralRatePerSqFt,
      currency: meta.currency || 'INR'
    });
  } catch (error) {
    next(error);
  }
};

