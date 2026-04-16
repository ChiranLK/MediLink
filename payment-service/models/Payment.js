import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'User ID is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    currency: {
      type: String,
      default: 'usd',
      enum: ['usd', 'eur', 'gbp', 'inr', 'lkr'],
    },
    paymentType: {
      type: String,
      enum: ['appointment', 'consultation', 'prescription'],
      required: [true, 'Payment type is required'],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Reference ID (appointment/consultation/prescription) is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
      default: 'pending',
      index: true,
    },
    stripePaymentIntentId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeCheckoutSessionId: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    stripeChargeId: {
      type: String,
      unique: true,
      sparse: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'bank_transfer', 'digital_wallet'],
    },
    receipt: {
      url: String,
      receiptNumber: String,
    },
    metadata: {
      appointmentId: String,
      doctorId: String,
      doctorName: String,
      patientName: String,
      description: String,
    },
    failureReason: String,
  },
  {
    timestamps: true,
    indexes: [{ userId: 1, createdAt: -1 }],
  }
);

export default mongoose.model('Payment', paymentSchema);
