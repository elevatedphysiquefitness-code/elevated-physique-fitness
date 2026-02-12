import Stripe from 'stripe';

let stripe: Stripe | null = null;

export function getStripeServer(): Stripe {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not set');
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

// Price IDs will be set after creating products in Stripe Dashboard
// Format: { planType: { planKey: { interval: priceId } } }
export const STRIPE_PRICES: Record<string, Record<string, Record<string, string>>> = {
  inperson: {
    unlimited: {
      weekly: process.env.STRIPE_PRICE_INPERSON_UNLIMITED_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_INPERSON_UNLIMITED_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_INPERSON_UNLIMITED || '',
    },
    'elevated-physique': {
      weekly: process.env.STRIPE_PRICE_INPERSON_ELEVATED_PHYSIQUE_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_INPERSON_ELEVATED_PHYSIQUE_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_INPERSON_ELEVATED_PHYSIQUE || '',
    },
    physique: {
      weekly: process.env.STRIPE_PRICE_INPERSON_PHYSIQUE_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_INPERSON_PHYSIQUE_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_INPERSON_PHYSIQUE || '',
    },
    elevated: {
      weekly: process.env.STRIPE_PRICE_INPERSON_ELEVATED_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_INPERSON_ELEVATED_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_INPERSON_ELEVATED || '',
    },
  },
  online: {
    unlimited: {
      weekly: process.env.STRIPE_PRICE_ONLINE_UNLIMITED_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_ONLINE_UNLIMITED_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_ONLINE_UNLIMITED || '',
    },
    'elevated-physique': {
      weekly: process.env.STRIPE_PRICE_ONLINE_ELEVATED_PHYSIQUE_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_ONLINE_ELEVATED_PHYSIQUE_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_ONLINE_ELEVATED_PHYSIQUE || '',
    },
    physique: {
      weekly: process.env.STRIPE_PRICE_ONLINE_PHYSIQUE_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_ONLINE_PHYSIQUE_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_ONLINE_PHYSIQUE || '',
    },
    elevated: {
      weekly: process.env.STRIPE_PRICE_ONLINE_ELEVATED_WEEKLY || '',
      biweekly: process.env.STRIPE_PRICE_ONLINE_ELEVATED_BIWEEKLY || '',
      monthly: process.env.STRIPE_PRICE_ONLINE_ELEVATED || '',
    },
  },
  test: {
    'test-plan': {
      weekly: process.env.STRIPE_PRICE_TEST || '',
      biweekly: process.env.STRIPE_PRICE_TEST || '',
      monthly: process.env.STRIPE_PRICE_TEST || '',
    },
  },
};
