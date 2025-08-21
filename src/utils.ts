export function currency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export enum PaymentMethodEnum {
  CREDIT_CARD = 'credit-card',
  BANK_ACCOUNT = 'bank-account',
  APPLE_PAY = 'apple-pay',
  GOOGLE_PAY = 'google-pay',
}

export const availablePaymentMethods = [
  { id: PaymentMethodEnum.CREDIT_CARD, title: 'Credit card' },
  { id: PaymentMethodEnum.BANK_ACCOUNT, title: 'Bank Account (ACH)' },
];
