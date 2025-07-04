export interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  paypalProductId: string;
}

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 50,
    price: 5,
    paypalProductId: 'STARTER_PACK', // Replace with your actual PayPal product ID
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 150,
    price: 10,
    paypalProductId: 'PRO_PACK', // Replace with your actual PayPal product ID
  },
  {
    id: 'premium',
    name: 'Premium Pack',
    credits: 500,
    price: 20,
    paypalProductId: 'PREMIUM_PACK', // Replace with your actual PayPal product ID
  },
]; 