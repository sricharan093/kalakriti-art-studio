import mongoose from 'mongoose';

const studioMetaSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    muralRatePerSqFt: {
      type: Number,
      default: 150
    },
    potteryItems: [
      {
        id: String,
        name: String
      }
    ],
    glazes: [
      {
        id: String,
        name: String
      }
    ]
  },
  {
    timestamps: true
  }
);

export const StudioMeta = mongoose.model('StudioMeta', studioMetaSchema);
