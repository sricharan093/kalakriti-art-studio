import mongoose from 'mongoose';

const potteryRequestSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    item: {
      id: { type: String, required: true },
      name: { type: String, required: true }
    },
    glaze: {
      id: { type: String, required: true },
      name: { type: String, required: true }
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [12, 'Quantity cannot exceed 12']
    },
    neededByDate: {
      type: String,
      required: [true, 'Needed-by date is required'],
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['requested', 'accepted', 'declined', 'cancelled'],
      default: 'requested',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const PotteryRequest = mongoose.model('PotteryRequest', potteryRequestSchema);
