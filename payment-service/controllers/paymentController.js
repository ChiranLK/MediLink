import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import { 
  createCheckoutSession as createStripeCheckoutSession,
  retrieveCheckoutSession,
  createRefund,
} from '../utils/stripeUtils.js';
import {
  PaymentNotFoundError,
  InvalidPaymentError,
  StripeError,
  RefundError,
} from '../errors/customErrors.js';
import { v4 as uuidv4 } from 'uuid';

// Create checkout session for payment
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { amount, currency = 'lkr', paymentType, referenceId, metadata } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!amount || !paymentType || !referenceId) {
      throw new InvalidPaymentError('Missing required fields: amount, paymentType, referenceId');
    }

    // Build success and cancel URLs
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/payment/success?sessionId={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/payment/cancel`;

    // Create Stripe checkout session
    const checkoutSession = await createStripeCheckoutSession(
      amount,
      currency,
      paymentType,
      referenceId,
      {
        ...metadata,
        description: `${paymentType} payment for user ${userId}`,
      },
      successUrl,
      cancelUrl
    );

    // Save payment to DB with pending status (Non-fatal fallback)
    let paymentId = 'pending_in_stripe';
    try {
      const payment = await Payment.create({
        userId,
        amount,
        currency,
        paymentType,
        referenceId,
        stripeCheckoutSessionId: checkoutSession.id,
        status: 'pending',
        metadata: {
          ...metadata,
          description: `${paymentType} payment`,
        },
      });
      paymentId = payment._id;
    } catch (dbError) {
      console.error('⚠️ DB Error: Could not save payment record, but continuing with Stripe redirect:', dbError.message);
    }

    res.status(201).json({
      status: 'success',
      data: {
        paymentId,
        checkoutSessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url,
        amount: amount,
        currency: currency,
      },
    });
  } catch (error) {
    next(new StripeError(error.message));
  }
};

// Verify checkout session completion
export const verifyCheckoutSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;
    const userId = req.user?.userId || req.user?._id;

    if (!sessionId) {
      throw new InvalidPaymentError('Checkout session ID is required');
    }

    // Retrieve session from Stripe
    const session = await retrieveCheckoutSession(sessionId);

    if (session.payment_status !== 'paid') {
      throw new InvalidPaymentError(`Checkout session not completed. Status: ${session.payment_status}`);
    }

    // Find and update payment in DB
    const payment = await Payment.findOneAndUpdate(
      { stripeCheckoutSessionId: sessionId },
      {
        status: 'completed',
        stripeChargeId: session.payment_intent?.charges?.data[0]?.id,
        paymentMethod: 'card',
        receipt: {
          url: session.payment_intent?.charges?.data[0]?.receipt_url,
          receiptNumber: session.id,
        },
      },
      { new: true }
    );

    if (!payment) {
      throw new PaymentNotFoundError();
    }

    // Verify user owns this payment
    if (payment.userId.toString() !== userId.toString()) {
      throw new InvalidPaymentError('Unauthorized access to this payment');
    }

    // Create transaction record
    await Transaction.create({
      paymentId: payment._id,
      transactionId: uuidv4(),
      amount: payment.amount,
      fee: payment.amount * 0.029 + 0.30,
      netAmount: payment.amount - (payment.amount * 0.029 + 0.30),
      status: 'success',
      stripeEventId: session.payment_intent?.id,
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        amount: payment.amount,
        status: payment.status,
      },
    });
  } catch (error) {
    next(error instanceof InvalidPaymentError || error instanceof PaymentNotFoundError
      ? error
      : new StripeError(error.message));
  }
};

// Get payment by ID
export const getPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.userId || req.user?._id;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError();
    }

    // Verify ownership
    if (payment.userId.toString() !== userId.toString()) {
      throw new InvalidPaymentError('Unauthorized access to this payment');
    }

    res.status(200).json({
      status: 'success',
      data: payment,
    });
  } catch (error) {
    next(error instanceof PaymentNotFoundError || error instanceof InvalidPaymentError
      ? error
      : new PaymentNotFoundError());
  }
};

// Monthly earnings for a doctor (completed appointment payments with metadata.doctorId)
export const getDoctorPaymentSummary = async (req, res, next) => {
  try {
    const { doctorId } = req.query;
    if (!doctorId) {
      return res.status(400).json({
        status: 'error',
        message: 'doctorId query parameter is required',
      });
    }

    const role = req.user?.role;
    if (role !== 'doctor' && role !== 'admin') {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const agg = await Payment.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          'metadata.doctorId': String(doctorId),
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const monthlyTotal = agg[0]?.total || 0;

    res.status(200).json({
      status: 'success',
      data: {
        monthlyTotal,
        currency: 'LKR',
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get all payments for a user
export const getUserPayments = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { userId };
    if (status) query.status = status;

    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Refund a payment
export const refundPayment = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;
    const userId = req.user?.userId || req.user?._id;

    const payment = await Payment.findById(paymentId);

    if (!payment) {
      throw new PaymentNotFoundError();
    }

    if (payment.userId.toString() !== userId.toString()) {
      throw new InvalidPaymentError('Unauthorized access to this payment');
    }

    if (payment.status === 'refunded') {
      throw new RefundError('Payment already refunded');
    }

    if (payment.status !== 'completed') {
      throw new RefundError('Only completed payments can be refunded');
    }

    // Create refund with Stripe
    const refund = await createRefund(payment.stripeChargeId, amount, reason);

    // Update payment status
    payment.status = 'refunded';
    await payment.save();

    res.status(200).json({
      status: 'success',
      message: 'Payment refund initiated',
      data: {
        paymentId: payment._id,
        refundAmount: amount || payment.amount,
        stripeRefundId: refund.id,
      },
    });
  } catch (error) {
    next(error instanceof RefundError || error instanceof PaymentNotFoundError || error instanceof InvalidPaymentError
      ? error
      : new RefundError(error.message));
  }
};

export default {
  createCheckoutSession,
  verifyCheckoutSession,
  getPayment,
  getUserPayments,
  refundPayment,
};
