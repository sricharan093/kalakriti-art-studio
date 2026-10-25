import mongoose from 'mongoose';

const wallBookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    bookingDate: {
      type: String,
      required: [true, 'Booking date is required'],
      unique: true, // Database-level uniqueness: one booking per date
      trim: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Booking date must be in YYYY-MM-DD format']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters']
    },
    wallSize: {
      type: Number,
      required: [true, 'Wall size in square feet is required'],
      min: [10, 'Wall size must be at least 10 sq ft'],
      max: [500, 'Wall size cannot exceed 500 sq ft']
    },
    appliedRate: {
      type: Number,
      required: true,
      default: 150
    },
    totalPrice: {
      type: Number,
      required: true
    },
    selectedDesign: {
      id: {
        type: String,
        default: 'traditional-warli'
      },
      name: {
        type: String,
        default: 'Traditional Warli & Folk Murals'
      },
      previewImage: {
        type: String,
        default: '/images/p-002.jpg'
      }
    },
    status: {
      type: String,
      enum: ['requested', 'confirmed', 'declined', 'cancelled'],
      default: 'requested',
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const WallBooking = mongoose.model('WallBooking', wallBookingSchema);
