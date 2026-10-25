import mongoose from 'mongoose';

const paintingSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price must be positive']
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'sold', 'archived'],
      default: 'available',
      index: true
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true
    },
    category: {
      type: String,
      default: '',
      trim: true
    },
    dimensions: {
      type: String,
      default: '',
      trim: true
    },
    medium: {
      type: String,
      default: '',
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export const Painting = mongoose.model('Painting', paintingSchema);
