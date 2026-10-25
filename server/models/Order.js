import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    painting: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Painting',
      required: true,
      index: true
    },
    paintingId: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Order price must be positive']
    },
    status: {
      type: String,
      enum: ['placed', 'cancelled'],
      default: 'placed',
      index: true
    },
    deliveryAddress: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      streetAddress: { type: String, trim: true },
      addressLine2: { type: String, trim: true, default: '' },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      postalCode: { type: String, trim: true }
    }
  },
  {
    timestamps: true
  }
);

export const Order = mongoose.model('Order', orderSchema);
