import { RefObject, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicSquare } from '@publicsquare/elements-react';
import PublicSquareTypes from '@publicsquare/elements-react/types';

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

export function useCheckoutSubmit() {
  const { publicsquare } = usePublicSquare();
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmitCardElement(
    amount: number,
    values: {
      name_on_card: string;
      amount: number;
      customer: any;
      address: any;
    },
    cardElement: RefObject<PublicSquareTypes.CardElement | null>,
    type: 'payment' | 'payout' = 'payment',
  ) {
    try {
      if (cardElement.current && !submitting) {
        setSubmitting(true);
        const card = await createCard(values, cardElement.current);
        if (card) {
          const payment = await capturePayment(amount, values, { card }, type);
          setSubmitting(false);
          return payment;
        }
      }
    } catch (error) {
      console.log(error);
    }
    setSubmitting(false);
  }

  async function createCard(
    values: { name_on_card: string },
    card: PublicSquareTypes.CardCreateInput['card'],
  ) {
    if (values.name_on_card && card && publicsquare) {
      try {
        const response = await publicsquare.cards.create({
          cardholder_name: values.name_on_card,
          card,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function capturePayment(
    amount: number,
    values: { amount: number; customer: any; address: any },
    {
      card,
      bankAccount,
      applePay,
    }: {
      card?: PublicSquareTypes.CardCreateResponse;
      bankAccount?: PublicSquareTypes.BankAccountCreateResponse;
      applePay?: PublicSquareTypes.ApplePayCreateResponse;
    },
    type: 'payment' | 'payout' = 'payment',
  ) {
    try {
      const payment = await fetch(`/api/${type}s`, {
        method: 'POST',
        body: JSON.stringify({
          // amount should be in cents rather than dollars
          amount,
          // optional, USD is assumed
          currency: 'USD',
          payment_method: {
            ...(card && { card: card.id }),
            ...(bankAccount && { bank_account: bankAccount.id }),
            ...(applePay && { apple_pay: applePay.id }),
          },
          customer: values.customer,
          billing_details: values.address,
        }),
      }).then((res) => res.json());
      return payment;
    } catch (_error) {}
  }

  async function onSubmitBankAccountElement(
    amount: number,
    values: any,
    bankAccountElement: RefObject<PublicSquareTypes.BankAccountElement | null>,
    type: 'payment' | 'payout' = 'payment',
  ) {
    try {
      if (bankAccountElement.current && !submitting) {
        setSubmitting(true);
        const bankAccount = await createBankAccount(values, bankAccountElement);
        if (bankAccount) {
          const payment = await capturePayment(amount, values, { bankAccount }, type);
          setSubmitting(false);
          return payment;
        }
      }
    } catch (error) {
      console.log(error);
    }
    setSubmitting(false);
  }

  async function createBankAccount(values: any, bankAccountElement: any) {
    if (
      values.account_holder_name &&
      bankAccountElement.current?.routingNumber.el.value &&
      bankAccountElement.current?.accountNumber.el.value &&
      publicsquare
    ) {
      try {
        const response = await publicsquare.bankAccounts.create({
          account_holder_name: values.account_holder_name,
          routing_number: bankAccountElement.current?.routingNumber.el.value,
          account_number: bankAccountElement.current?.accountNumber.el.value,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function onSubmitBankAccountVerificationElement(
    amount: number,
    values: any,
    bankAccountVerificationElement: RefObject<PublicSquareTypes.BankAccountVerificationElement | null>,
    type: 'payment' | 'payout' = 'payment',
  ) {
    try {
      if (bankAccountVerificationElement.current && !submitting) {
        setSubmitting(true);
        const bankAccount = await createBankAccountVerification(
          values,
          bankAccountVerificationElement,
        );
        if (bankAccount) {
          const payment = await capturePayment(amount, values, { bankAccount }, type);
          setSubmitting(false);
          return payment;
        }
      }
    } catch (error) {
      console.log(error);
    }
    setSubmitting(false);
  }

  async function createBankAccountVerification(values: any, bankAccountVerificationElement: any) {
    if (bankAccountVerificationElement.current?.bank_account_verification_id && publicsquare) {
      try {
        const response = await publicsquare.bankAccounts.create({
          bank_account_verification_id:
            bankAccountVerificationElement.current?.bank_account_verification_id,
        });
        return response;
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function onSubmitApplePay(
    amount: number,
    values: {
      amount: number;
      customer: any;
      address: any;
    },
  ) {
    if (!window.ApplePaySession) {
      return;
    }

    const session = createApplePaySession(amount);

    session.onvalidatemerchant = async () => {
      const merchantSession = await validateMerchant();
      session.completeMerchantValidation(merchantSession);
    };

    session.onpaymentauthorized = async (event: any) => {
      try {
        const applePay = await createApplePay(event.payment.token);
        if (applePay) {
          const payment = await capturePayment(amount, values, { applePay }, 'payment');
          setSubmitting(false);

          // present green check to the user before the timeout (30 seconds)
          session.completePayment(window.ApplePaySession.STATUS_SUCCESS);

          if (payment?.id) {
            router.push(`/ecommerce/orders/${payment.id}/summary`);
          }
        }

        setSubmitting(false);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      } catch (e) {
        console.error(e);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      }
    };

    session.begin();
  }

  async function createApplePay(applePaymentData: PublicSquareTypes.ApplePaymentData) {
    if (publicsquare) {
      try {
        console.log('Apple Pay token', applePaymentData);

        const response = await publicsquare.applePay.create({
          apple_payment_data: applePaymentData,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  function createApplePaySession(total: number) {
    return new window.ApplePaySession(3, {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS'],
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      total: {
        label: 'PublicSquare Payments Demo',
        type: 'final',
        amount: (total / 100).toFixed(2),
      },
    });
  }

  async function validateMerchant() {
    try {
      const session = await publicsquare?.applePay.createSession({
        display_name: 'PublicSquare Payments Demo',
        domain: window.location.host,
      });

      console.log(session);
      return session;
    } catch (error) {
      console.error('Error validating merchant:', error);
      throw error;
    }
  }

  return {
    createCard,
    submitting,
    onSubmitCardElement,
    onSubmitBankAccountElement,
    onSubmitBankAccountVerificationElement,
    onSubmitApplePay,
  };
}
