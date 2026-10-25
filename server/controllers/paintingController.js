import fs from 'fs';
import mongoose from 'mongoose';
import { Painting } from '../models/Painting.js';
import { Order } from '../models/Order.js';
import { createPaintingSchema, updatePaintingSchema } from '../validators/paintingValidator.js';
import { persistUploadedImage, removeStoredImage } from '../services/imageStorageService.js';

const safeUnlink = (file) => {
  if (file?.path && fs.existsSync(file.path)) {
    try {
      fs.unlinkSync(file.path);
    } catch (err) {
      console.warn('Failed to delete temporary upload file:', err?.message);
    }
  }
};

export const getAllPaintings = async (req, res, next) => {
  try {
    const { status, category, includeArchived } = req.query;
    const filter = {};

    // Check if requester is authorized admin requesting all or archived items
    const isAdmin = req.user?.role === 'ADMIN';
    const allowArchived = includeArchived === 'true' && isAdmin;

    if (allowArchived) {
      if (status && ['available', 'sold', 'archived'].includes(status)) {
        filter.status = status;
      }
    } else {
      // By default for customers / public store:
      // strictly exclude archived paintings
      filter.status = { $ne: 'archived' };
      filter.isArchived = { $ne: true };

      if (status && ['available', 'sold'].includes(status)) {
        filter.status = status;
      }
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    const paintings = await Painting.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: paintings.length,
      paintings
    });
  } catch (error) {
    next(error);
  }
};

export const getPaintingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let painting;
    if (mongoose.Types.ObjectId.isValid(id)) {
      painting = await Painting.findById(id);
    }
    if (!painting) {
      painting = await Painting.findOne({ id });
    }

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    // If painting is archived, only administrator can view details
    const isArchived = painting.status === 'archived' || painting.isArchived === true;
    if (isArchived && req.user?.role !== 'ADMIN') {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    return res.status(200).json({
      success: true,
      painting
    });
  } catch (error) {
    next(error);
  }
};

export const uploadPaintingImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select a valid JPG, PNG, or WebP file.'
      });
    }

    const uploadResult = await persistUploadedImage(req.file);

    return res.status(200).json({
      success: true,
      message: 'Painting image uploaded successfully',
      imageUrl: uploadResult.url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      storage: uploadResult.storage
    });
  } catch (error) {
    safeUnlink(req.file);
    next(error);
  }
};

export const createPainting = async (req, res, next) => {
  try {
    let uploadedImageUrl = null;

    // Handle multipart image upload
    if (req.file) {
      const uploadResult = await persistUploadedImage(req.file);
      uploadedImageUrl = uploadResult.url;
      req.body.imageUrl = uploadedImageUrl;
    }

    let validatedData;
    try {
      validatedData = createPaintingSchema.parse(req.body);
    } catch (validationError) {
      safeUnlink(req.file);
      if (uploadedImageUrl) {
        await removeStoredImage(uploadedImageUrl);
      }
      return next(validationError);
    }

    const customId = validatedData.id || `p-${Date.now().toString().slice(-4)}`;

    const existing = await Painting.findOne({ id: customId });
    if (existing) {
      safeUnlink(req.file);
      if (uploadedImageUrl) {
        await removeStoredImage(uploadedImageUrl);
      }
      return res.status(409).json({
        success: false,
        message: `A painting with identifier ${customId} already exists.`
      });
    }

    const painting = new Painting({
      id: customId,
      title: validatedData.title,
      artist: validatedData.artist,
      description: validatedData.description || '',
      price: validatedData.price,
      imageUrl: validatedData.imageUrl,
      status: validatedData.status || 'available',
      isArchived: validatedData.status === 'archived',
      category: validatedData.category || '',
      dimensions: validatedData.dimensions || '',
      medium: validatedData.medium || ''
    });

    await painting.save();

    return res.status(201).json({
      success: true,
      message: 'Painting created successfully',
      painting
    });
  } catch (error) {
    safeUnlink(req.file);
    next(error);
  }
};

export const updatePainting = async (req, res, next) => {
  try {
    const { id } = req.params;
    let oldImageUrl = null;

    if (req.file) {
      const uploadResult = await persistUploadedImage(req.file);
      req.body.imageUrl = uploadResult.url;
    }

    let validatedData;
    try {
      validatedData = updatePaintingSchema.parse(req.body);
    } catch (validationError) {
      safeUnlink(req.file);
      return next(validationError);
    }

    let painting;
    if (mongoose.Types.ObjectId.isValid(id)) {
      painting = await Painting.findById(id);
    }
    if (!painting) {
      painting = await Painting.findOne({ id });
    }

    if (!painting) {
      safeUnlink(req.file);
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    // Studio Integrity Rule: Cannot edit a sold or unavailable painting
    if (painting.status !== 'available') {
      safeUnlink(req.file);
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a sold or unavailable painting.'
      });
    }

    oldImageUrl = painting.imageUrl;

    // Synchronize isArchived flag if status is explicitly changed
    if (validatedData.status === 'archived') {
      validatedData.isArchived = true;
    } else if (validatedData.status === 'available' || validatedData.status === 'sold') {
      validatedData.isArchived = false;
    }

    Object.assign(painting, validatedData);
    await painting.save();

    // If image was replaced, remove old image if not seeded
    if (validatedData.imageUrl && validatedData.imageUrl !== oldImageUrl) {
      await removeStoredImage(oldImageUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'Painting updated successfully',
      painting
    });
  } catch (error) {
    safeUnlink(req.file);
    next(error);
  }
};

export const deletePainting = async (req, res, next) => {
  try {
    const { id } = req.params;

    let painting;
    if (mongoose.Types.ObjectId.isValid(id)) {
      painting = await Painting.findById(id);
    }
    if (!painting) {
      painting = await Painting.findOne({ id });
    }

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    // Check if this painting is associated with any customer orders
    const orderCount = await Order.countDocuments({
      $or: [{ painting: painting._id }, { paintingId: painting.id }]
    });

    if (orderCount > 0) {
      // Historical order preservation: Archive rather than hard-delete
      painting.status = 'archived';
      painting.isArchived = true;
      await painting.save();

      return res.status(200).json({
        success: true,
        action: 'archived',
        message: `Painting "${painting.title}" has ${orderCount} existing customer order(s). It has been safely archived to protect order records, and is removed from the active customer catalogue.`,
        painting
      });
    }

    // No associated orders: safe to permanently delete from database & disk
    const storedImageUrl = painting.imageUrl;
    await Painting.deleteOne({ _id: painting._id });

    // Clean up uploaded file if not a seeded asset
    await removeStoredImage(storedImageUrl);

    return res.status(200).json({
      success: true,
      action: 'deleted',
      message: `Painting "${painting.title}" was permanently deleted and removed from the active catalogue.`,
      paintingId: id
    });
  } catch (error) {
    next(error);
  }
};

export const restorePainting = async (req, res, next) => {
  try {
    const { id } = req.params;

    let painting;
    if (mongoose.Types.ObjectId.isValid(id)) {
      painting = await Painting.findById(id);
    }
    if (!painting) {
      painting = await Painting.findOne({ id });
    }

    if (!painting) {
      return res.status(404).json({
        success: false,
        message: 'Painting not found'
      });
    }

    painting.status = 'available';
    painting.isArchived = false;
    await painting.save();

    return res.status(200).json({
      success: true,
      message: `Painting "${painting.title}" has been restored to the active catalogue.`,
      painting
    });
  } catch (error) {
    next(error);
  }
};
