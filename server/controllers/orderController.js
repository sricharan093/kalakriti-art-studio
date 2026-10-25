import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Painting } from '../models/Painting.js';
import { createOrderSchema, normalizeDeliveryAddressInput } from '../validators/orderValidator.js';

export const createOrder = async (req, res, next) => {
  try {
    // 1. Verify role is CUSTOMER
    if (req.user?.role !== 'CUSTOMER') {
      return res.status(403).json({ success: false, message: 'Only customer accounts can purchase paintings' });
    }

    // 2. Normalize and validate delivery address and paintingId
    const rawDeliveryAddress = req.body.deliveryAddress
      ? normalizeDeliveryAddressInput(req.body.deliveryAddress)
      : normalizeDeliveryAddressInput(req.body);

    const validated = createOrderSchema.parse({
      paintingId: req.body.paintingId,
      deliveryAddress: rawDeliveryAddress
    });

    const { paintingId, deliveryAddress } = validated;

    // 3. Prepare query for painting by _id or custom id
    const query = {
      status: 'available',
      isArchived: { $ne: true },
      ...(mongoose.Types.ObjectId.isValid(paintingId)
        ? { $or: [{ _id: paintingId }, { id: paintingId }] }
        : { id: paintingId })
    };

    // 4. Atomic update: only succeeds if status is currently 'available' and not archived
    const painting = await Painting.findOneAndUpdate(
      query,
      { $set: { status: 'sold' } },
      { new: true }
    );

    if (!painting) {
      // Check if it exists or is already sold / archived
      const existsQuery = mongoose.Types.ObjectId.isValid(paintingId)
        ? { $or: [{ _id: paintingId }, { id: paintingId }] }
        : { id: paintingId };
      const exists = await Painting.findOne(existsQuery);

      if (!exists) {
        return res.status(404).json({ success: false, message: 'Painting not found' });
      }

      if (exists.status === 'archived' || exists.isArchived) {
        return res.status(400).json({
          success: false,
          message: 'This painting has been archived and is no longer available for purchase.'
        });
      }

      return res.status(409).json({
        success: false,
        message: 'This painting has just been sold. Please choose another painting.'
      });
    }

    // 5. Create the order linked to authenticated customer with price and address snapshot
    try {
      const order = new Order({
        customer: req.user._id,
        painting: painting._id,
        paintingId: painting.id,
        price: painting.price,
        status: 'placed',
        deliveryAddress: {
          fullName: deliveryAddress.fullName,
          phone: deliveryAddress.phone,
          streetAddress: deliveryAddress.streetAddress,
          addressLine2: deliveryAddress.addressLine2 || '',
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode
        }
      });
      await order.save();

      // If customer explicitly requested to save as default address, update user profile
      if (req.body.saveAsDefault) {
        const { User } = await import('../models/User.js');
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            defaultAddress: {
              fullName: deliveryAddress.fullName,
              phone: deliveryAddress.phone,
              streetAddress: deliveryAddress.streetAddress,
              addressLine2: deliveryAddress.addressLine2 || '',
              city: deliveryAddress.city,
              state: deliveryAddress.state,
              postalCode: deliveryAddress.postalCode
            },
            ...(deliveryAddress.phone ? { phone: deliveryAddress.phone } : {})
          }
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Painting purchased successfully!',
        order: {
          ...order.toObject(),
          paintingTitle: painting.title,
          paintingImage: painting.imageUrl
        }
      });
    } catch (saveError) {
      // Revert painting status if order save failed
      await Painting.findByIdAndUpdate(painting._id, { status: 'available' });
      throw saveError;
    }
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('painting', 'title artist imageUrl price status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Atomic update: only cancels if belonging to this customer AND status is currently 'placed'
    const order = await Order.findOneAndUpdate(
      {
        _id: id,
        customer: req.user._id,
        status: 'placed'
      },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!order) {
      // Ownership check: If customer attempts to access another customer's record, return 404
      const existing = await Order.findById(id);
      if (!existing || existing.customer.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled because it is already '${existing.status}'.`
      });
    }

    // Restore painting availability only if not archived
    const associatedPainting = await Painting.findById(order.painting);
    if (associatedPainting && !associatedPainting.isArchived && associatedPainting.status !== 'archived') {
      await Painting.findByIdAndUpdate(order.painting, { status: 'available' });
    }

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

export const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('painting', 'title artist imageUrl price status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};
