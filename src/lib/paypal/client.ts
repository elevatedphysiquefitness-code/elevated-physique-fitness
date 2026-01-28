export const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;

// PayPal Plan IDs from dashboard
export const PAYPAL_PLAN_IDS = {
  unlimited: process.env.NEXT_PUBLIC_PAYPAL_PLAN_UNLIMITED!,
  elevated_physique: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ELEVATED_PHYSIQUE!,
  physique: process.env.NEXT_PUBLIC_PAYPAL_PLAN_PHYSIQUE!,
  elevated: process.env.NEXT_PUBLIC_PAYPAL_PLAN_ELEVATED!,
};

export interface SubscriptionPlan {
  name: string;
  description: string;
  price: number;
  interval: 'WEEK' | 'MONTH';
  intervalCount: number;
  paypalPlanId: string;
  type: 'in-person' | 'online';
  features: string[];
}

// Subscription plans mapped to PayPal Plan IDs
export const SUBSCRIPTION_PLANS: Record<string, SubscriptionPlan> = {
  // In-Person Plans
  'unlimited': {
    name: 'Unlimited Training',
    description: 'Unlimited in-person training sessions',
    price: 900,
    interval: 'MONTH',
    intervalCount: 1,
    paypalPlanId: PAYPAL_PLAN_IDS.unlimited,
    type: 'in-person',
    features: [
      'Unlimited training sessions',
      'Personalized workout programs',
      'Nutrition guidance',
      'Weekly check-ins',
      'Direct messaging with coach',
      'Access to Elevated Physique App',
    ],
  },
  'elevated-physique': {
    name: 'Elevated Physique',
    description: 'Premium coaching package',
    price: 650,
    interval: 'MONTH',
    intervalCount: 1,
    paypalPlanId: PAYPAL_PLAN_IDS.elevated_physique,
    type: 'in-person',
    features: [
      '4 training sessions per week',
      'Personalized workout programs',
      'Nutrition guidance',
      'Weekly check-ins',
      'Direct messaging with coach',
      'Access to Elevated Physique App',
    ],
  },
  'physique': {
    name: 'Physique',
    description: 'Online coaching program',
    price: 375,
    interval: 'MONTH',
    intervalCount: 1,
    paypalPlanId: PAYPAL_PLAN_IDS.physique,
    type: 'online',
    features: [
      'Custom workout programs',
      'Nutrition recommendations',
      'Bi-weekly check-ins',
      'App access with exercise library',
      'Email support',
    ],
  },
  'elevated': {
    name: 'Elevated',
    description: 'Premium online coaching',
    price: 500,
    interval: 'MONTH',
    intervalCount: 1,
    paypalPlanId: PAYPAL_PLAN_IDS.elevated,
    type: 'online',
    features: [
      'Custom workout programs',
      'Detailed nutrition guidance',
      'Weekly check-ins',
      'Direct messaging with coach',
      'Video form reviews',
      'Full app access',
    ],
  },
};

// Helper to get plan by ID
export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS[planId];
}

// Helper to get PayPal Plan ID
export function getPayPalPlanId(planId: string): string | undefined {
  const plan = SUBSCRIPTION_PLANS[planId];
  return plan?.paypalPlanId;
}
