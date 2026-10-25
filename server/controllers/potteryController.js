import mongoose from 'mongoose';
import { PotteryRequest } from '../models/PotteryRequest.js';
import { StudioMeta } from '../models/StudioMeta.js';
import { createPotterySchema, updatePotterySchema } from '../validators/potteryValidator.js';

// Default fallback options matching the seed data
const DEFAULT_ITEMS = [
  { id: 'i-01', name: 'Kulhad (clay cup)' },
  { id: 'i-02', name: 'Surahi (water jug)' },
  { id: 'i-03', name: 'Matka (water pot)' },
  { id: 'i-04', name: 'Diya set' },
  { id: 'i-05', name: 'Gamla (planter)' }
];

const DEFAULT_GLAZES = [
  { id: 'g-01', name: 'Kumkum Red' },
  { id: 'g-02', name: 'Haldi Yellow' },
  { id: 'g-03', name: 'Mehendi Green' },
  { id: 'g-04', name: 'Indigo Blue' },
  { id: 'g-05', name: 'Sandalwood Beige' },
  { id: 'g-06', name: 'Charcoal Black' }
];

export const getPotteryOptions = async (req, res, next) => {
  try {
    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const items = meta?.potteryItems?.length ? meta.potteryItems : DEFAULT_ITEMS;
    const glazes = meta?.glazes?.length ? meta.glazes : DEFAULT_GLAZES;

    return res.status(200).json({
      success: true,
      items,
      glazes
    });
  } catch (error) {
    next(error);
  }
};

export const createPotteryRequest = async (req, res, next) => {
  try {
    const validatedData = createPotterySchema.parse(req.body);

    // Verify item and glaze against official options
    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const items = meta?.potteryItems?.length ? meta.potteryItems : DEFAULT_ITEMS;
    const glazes = meta?.glazes?.length ? meta.glazes : DEFAULT_GLAZES;

    const matchedItem = items.find((i) => i.id === validatedData.itemId);
    if (!matchedItem) {
      return res.status(400).json({
        success: false,
        message: `Invalid pottery item '${validatedData.itemId}'. Please select a valid item.`
      });
    }

    const matchedGlaze = glazes.find((g) => g.id === validatedData.glazeId);
    if (!matchedGlaze) {
      return res.status(400).json({
        success: false,
        message: `Invalid glaze '${validatedData.glazeId}'. Please select a valid glaze.`
      });
    }

    const potteryRequest = new PotteryRequest({
      customer: req.user._id,
      item: { id: matchedItem.id, name: matchedItem.name },
      glaze: { id: matchedGlaze.id, name: matchedGlaze.name },
      quantity: validatedData.quantity,
      neededByDate: validatedData.neededByDate,
      notes: validatedData.notes || '',
      status: 'requested'
    });

    await potteryRequest.save();

    return res.status(201).json({
      success: true,
      message: 'Pottery custom request placed successfully!',
      potteryRequest
    });
  } catch (error) {
    next(error);
  }
};

export const getMyPotteryRequests = async (req, res, next) => {
  try {
    const requests = await PotteryRequest.find({ customer: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

export const updatePotteryRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Pottery request not found' });
    }

    const validatedData = updatePotterySchema.parse(req.body);

    const potteryReq = await PotteryRequest.findById(id);
    if (!potteryReq) {
      return res.status(404).json({ success: false, message: 'Pottery request not found' });
    }

    // Ownership check: If customer tries to access another customer's request -> 404
    if (potteryReq.customer.toString() !== req.user._id.toString()) {
      return res.status(404).json({ success: false, message: 'Pottery request not found' });
    }

    // Status check: Customers can edit only while status is 'requested'
    if (potteryReq.status !== 'requested') {
      return res.status(400).json({
        success: false,
        message: `Cannot edit request because it has already been '${potteryReq.status}'. Only 'requested' orders can be modified.`
      });
    }

    const meta = await StudioMeta.findOne({ key: 'studio_config' });
    const items = meta?.potteryItems?.length ? meta.potteryItems : DEFAULT_ITEMS;
    const glazes = meta?.glazes?.length ? meta.glazes : DEFAULT_GLAZES;

    if (validatedData.itemId) {
      const matchedItem = items.find((i) => i.id === validatedData.itemId);
      if (!matchedItem) {
        return res.status(400).json({ success: false, message: 'Invalid pottery item' });
      }
      potteryReq.item = { id: matchedItem.id, name: matchedItem.name };
    }

    if (validatedData.glazeId) {
      const matchedGlaze = glazes.find((g) => g.id === validatedData.glazeId);
      if (!matchedGlaze) {
        return res.status(400).json({ success: false, message: 'Invalid glaze' });
      }
      potteryReq.glaze = { id: matchedGlaze.id, name: matchedGlaze.name };
    }

    if (validatedData.quantity) potteryReq.quantity = validatedData.quantity;
    if (validatedData.neededByDate) potteryReq.neededByDate = validatedData.neededByDate;
    if (validatedData.notes !== undefined) potteryReq.notes = validatedData.notes;

    await potteryReq.save();

    return res.status(200).json({
      success: true,
      message: 'Pottery request updated successfully',
      potteryRequest: potteryReq
    });
  } catch (error) {
    next(error);
  }
};

export const cancelPotteryRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ success: false, message: 'Pottery request not found' });
    }

    // Atomic update: only cancels if customer matches and status is 'requested'
    const potteryReq = await PotteryRequest.findOneAndUpdate(
      {
        _id: id,
        customer: req.user._id,
        status: 'requested'
      },
      { $set: { status: 'cancelled' } },
      { new: true }
    );

    if (!potteryReq) {
      const existing = await PotteryRequest.findById(id);
      if (!existing || existing.customer.toString() !== req.user._id.toString()) {
        return res.status(404).json({ success: false, message: 'Pottery request not found' });
      }
      return res.status(400).json({
        success: false,
        message: `Cannot cancel pottery request because its status is '${existing.status}'.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Pottery request cancelled successfully',
      potteryRequest: potteryReq
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPotteryRequestsAdmin = async (req, res, next) => {
  try {
    const requests = await PotteryRequest.find()
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

export const updatePotteryStatusAdmin = (newStatus) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ success: false, message: 'Pottery request not found' });
      }

      const potteryReq = await PotteryRequest.findById(id);
      if (!potteryReq) {
        return res.status(404).json({ success: false, message: 'Pottery request not found' });
      }

      if (potteryReq.status !== 'requested') {
        return res.status(400).json({
          success: false,
          message: `Cannot transition pottery request from '${potteryReq.status}' to '${newStatus}'. Only 'requested' orders can be accepted or declined.`
        });
      }

      potteryReq.status = newStatus;
      await potteryReq.save();

      return res.status(200).json({
        success: true,
        message: `Pottery request ${newStatus} successfully`,
        potteryRequest: potteryReq
      });
    } catch (error) {
      next(error);
    }
  };
};

export const acceptPotteryRequest = updatePotteryStatusAdmin('accepted');
export const declinePotteryRequest = updatePotteryStatusAdmin('declined');
