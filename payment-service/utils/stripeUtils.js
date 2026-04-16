import Stripe from 'stripe';

console.log('[stripeUtils] STRIPE_SECRET_KEY at module load:', process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...' : 'UNDEFINED');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
export const createCheckoutSession = async (
  amount,
  currency = 'lkr',
  paymentType,
  referenceId,
  metadata = {},
  successUrl,
  cancelUrl
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} Payment`,
              description: metadata.description || `Payment for ${paymentType}`,
              metadata: {
                paymentType,
                referenceId,
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        paymentType,
        referenceId,
        ...metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: referenceId,
    });

    return session;
  } catch (error) {
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }
};

// Retrieve Checkout Session
export const retrieveCheckoutSession = async (sessionId) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['payment_intent'],
    });
    return session;
  } catch (error) {
    throw new Error(`Failed to retrieve checkout session: ${error.message}`);
  }
};

// Kept for backwards compatibility if needed
export const createPaymentIntent = async (amount, currency = 'usd', metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types: ['card'],
      metadata,
    });

    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to create payment intent: ${error.message}`);
  }
};

export const confirmPaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw new Error(`Failed to retrieve payment intent: ${error.message}`);
  }
};

export const createRefund = async (chargeId, amount = null, reason = 'requested_by_customer') => {
  try {
    const refund = await stripe.refunds.create({
      charge: chargeId,
      ...(amount && { amount: Math.round(amount * 100) }),
      reason,
    });

    return refund;
  } catch (error) {
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

export const retrieveCharge = async (chargeId) => {
  try {
    const charge = await stripe.charges.retrieve(chargeId);
    return charge;
  } catch (error) {
    throw new Error(`Failed to retrieve charge: ${error.message}`);
  }
};

export const constructEvent = (body, signature) => {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
};

export default stripe;
