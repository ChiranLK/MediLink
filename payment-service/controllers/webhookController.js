import { constructEvent } from '../utils/stripeUtils.js';
import Payment from '../models/Payment.js';
import Transaction from '../models/Transaction.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

export const handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];
    // express.raw() middleware gives us req.body as a Buffer
    const body = req.body;

    if (!signature) {
      console.error('Missing stripe-signature header');
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    if (!body) {
      console.error('Missing request body');
      return res.status(400).json({ error: 'Missing request body' });
    }

    console.log(`Received Stripe webhook with signature: ${signature.substring(0, 20)}...`);

    const event = constructEvent(body, signature);

    console.log(`Stripe webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case 'checkout.session.async_payment_succeeded':
        await handleCheckoutSessionAsyncPaymentSucceeded(event.data.object);
        break;

      case 'checkout.session.async_payment_failed':
        await handleCheckoutSessionAsyncPaymentFailed(event.data.object);
        break;

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;

      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('   Webhook signature verification failed!');
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    console.error('   Signature Received:', signature ? `${signature.substring(0, 30)}...` : 'MISSING');
    return res.status(400).json({ error: `Webhook Error: ${error.message}` });
  }
};

const handleCheckoutSessionCompleted = async (session) => {
  try {
    console.log(` Checkout session completed: ${session.id}`);
    const appointmentId = session.metadata?.appointmentId;
    console.log(` Extracting appointmentId from metadata: ${appointmentId || 'MISSING'}`);

    // Find and update payment
    const payment = await Payment.findOneAndUpdate(
      { stripeCheckoutSessionId: session.id },
      {
        status: 'completed',
        stripeChargeId: session.payment_intent?.charges?.data[0]?.id,
      },
      { returnDocument: 'after' }
    );

    if (payment) {
      console.log(`Payment ${payment._id} marked as completed`);

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

      // Notify appointment service to confirm appointment
      if (appointmentId) {
        try {
          const appointmentServiceUrl = process.env.APPOINTMENT_SERVICE_URL || 'http://localhost:3002';
          console.log(`Calling appointment-service at: ${appointmentServiceUrl}/api/appointments/${appointmentId}`);
          
          await axios.patch(`${appointmentServiceUrl}/api/appointments/${appointmentId}`, {
            status: 'Confirmed'
          });
          
          console.log(`✅ Appointment ${appointmentId} confirmed successfully via cross-service call.`);
        } catch (apiError) {
          console.error(`❌ Failed to confirm appointment ${appointmentId}:`, apiError.response?.data || apiError.message);
        }
      } else {
        console.warn('⚠️ No appointmentId found in session metadata. Skipping confirmation.');
      }
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error.message);
  }
};

const handleCheckoutSessionAsyncPaymentSucceeded = async (session) => {
  try {
    console.log(`Async payment succeeded for session: ${session.id}`);

    const payment = await Payment.findOneAndUpdate(
      { stripeCheckoutSessionId: session.id },
      {
        status: 'completed',
        stripeChargeId: session.payment_intent?.charges?.data[0]?.id,
      },
      { returnDocument: 'after' }
    );

    if (payment) {
      console.log(`Payment ${payment._id} marked as completed (async)`);

      await Transaction.create({
        paymentId: payment._id,
        transactionId: uuidv4(),
        amount: payment.amount,
        fee: payment.amount * 0.029 + 0.30,
        netAmount: payment.amount - (payment.amount * 0.029 + 0.30),
        status: 'success',
        stripeEventId: session.payment_intent?.id,
      });
    }
  } catch (error) {
    console.error('Error handling async payment success:', error.message);
  }
};

const handleCheckoutSessionAsyncPaymentFailed = async (session) => {
  try {
    console.log(`Async payment failed for session: ${session.id}`);

    const payment = await Payment.findOneAndUpdate(
      { stripeCheckoutSessionId: session.id },
      {
        status: 'failed',
        failureReason: 'Async payment failed',
      },
      { returnDocument: 'after' }
    );

    if (payment) {
      console.log(`Payment ${payment._id} marked as failed (async)`);

      await Transaction.create({
        paymentId: payment._id,
        transactionId: uuidv4(),
        amount: payment.amount,
        status: 'failed',
        errorMessage: 'Async payment failed',
        stripeEventId: session.payment_intent?.id,
      });
    }
  } catch (error) {
    console.error('Error handling async payment failure:', error.message);
  }
};

const handleChargeRefunded = async (charge) => {
  try {
    // Find and update payment
    const payment = await Payment.findOneAndUpdate(
      { stripeChargeId: charge.id },
      { status: 'refunded' },
      { returnDocument: 'after' }
    );

    if (payment) {
      console.log(`Payment ${payment._id} marked as refunded`);
    }
  } catch (error) {
    console.error('Error handling refund:', error.message);
  }
};

const handleDisputeCreated = async (dispute) => {
  try {
    console.warn(`Dispute created for charge ${dispute.charge}:`, dispute.reason);
    // TODO: Implement dispute handling logic
    // - Create dispute ticket
    // - Notify admin
    // - Hold payment pending resolution
  } catch (error) {
    console.error('Error handling dispute:', error.message);
  }
};

export default {
  handleStripeWebhook,
};
