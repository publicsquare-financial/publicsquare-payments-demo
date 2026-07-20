import { RefObject, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicSquare } from '@publicsquare/elements-react';
import PublicSquareTypes from '@publicsquare/elements-react/types';
import {
  CompletePaymentIntentRequest,
  ConfirmPaymentIntentRequest,
  PaymentIntentModel,
} from '@/types';

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

type ApplePayContactField = 'postalAddress' | 'phone' | 'email' | 'name';

// Apple Pay always requires billing address + phone number before a payment can complete.
const APPLE_PAY_REQUIRED_CONTACT_FIELDS: ApplePayContactField[] = ['postalAddress', 'phone'];
// Shipping address is not requested by default. Set this to true to require
// shipping contact collection on the Apple Pay sheet.
const APPLE_PAY_REQUIRE_SHIPPING_CONTACT = false;

export function useCheckoutSubmit() {
  const { publicsquare } = usePublicSquare();
  const publicsquareRef = useRef(publicsquare);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const cartAmount = useRef(0);

  useEffect(() => {
    publicsquareRef.current = publicsquare;
  }, [publicsquare]);

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
    environment: 'TEST' | 'PRODUCTION',
  ) {
    try {
      if (cardElement.current && !submitting) {
        setSubmitting(true);
        const card = await createCard(values, cardElement.current, environment);
        if (card) {
          const payment = await capturePayment(amount, values, { card }, type);
          setSubmitting(false);
          return payment;
        }
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitting(false);
  }

  async function createCard(
    values: { name_on_card: string },
    card: PublicSquareTypes.CardCreateInput['card'],
    environment: 'TEST' | 'PRODUCTION',
  ) {
    if (values.name_on_card && card && publicsquare) {
      try {
        const response = await publicsquare.cards.create(
          {
            cardholder_name: values.name_on_card,
            card,
          },
          environment,
        );
        if (response) {
          return response;
        }
      } catch (error) {
        console.error(error);
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
      googlePay,
    }: {
      card?: PublicSquareTypes.CardCreateResponse;
      bankAccount?: PublicSquareTypes.BankAccountCreateResponse;
      applePay?: PublicSquareTypes.ApplePayCreateResponse;
      googlePay?: PublicSquareTypes.GooglePayCreateResponse;
    },
    type: 'payment' | 'payout' = 'payment',
    overrides?: {
      billingDetails?: PublicSquareTypes.CardBillingDetails;
      shippingAddress?: PublicSquareTypes.CardBillingDetails;
    },
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
            ...(googlePay && { google_pay: googlePay.id }),
          },
          customer: values.customer,
          billing_details: overrides?.billingDetails ?? values.address,
          ...(overrides?.shippingAddress && { shipping_address: overrides.shippingAddress }),
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
      console.error(error);
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
        console.error(error);
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
      console.error(error);
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
        console.error(error);
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
        const applePayPayment = event.payment as PublicSquareTypes.ApplePayPayment;
        const billingDetails = mapApplePayContactToBillingDetails(applePayPayment.billingContact);
        const shippingAddress =
          APPLE_PAY_REQUIRE_SHIPPING_CONTACT && applePayPayment.shippingContact
            ? mapApplePayContactToBillingDetails(applePayPayment.shippingContact)
            : undefined;

        const applePay = await createApplePay(applePayPayment);

        if (applePay) {
          const payment = await capturePayment(amount, values, { applePay }, 'payment', {
            billingDetails,
            shippingAddress,
          });
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

  function mapApplePayContactToBillingDetails(
    contact?: PublicSquareTypes.ApplePayPaymentContact,
  ): PublicSquareTypes.CardBillingDetails {
    return {
      address_line_1: contact?.addressLines?.[0] ?? '',
      address_line_2: contact?.addressLines?.[1],
      city: contact?.locality ?? '',
      state: contact?.administrativeArea ?? '',
      postal_code: contact?.postalCode ?? '',
      country: contact?.countryCode ?? contact?.country ?? '',
    };
  }

  async function createApplePay(applePaymentData: PublicSquareTypes.ApplePayPayment) {
    if (publicsquare) {
      try {
        const response = await publicsquare.applePay.create({
          apple_payment_data: applePaymentData,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  function createApplePaySession(total: number) {
    return new window.ApplePaySession(3, {
      countryCode: 'US',
      currencyCode: 'USD',
      merchantCapabilities: ['supports3DS'],
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      requiredBillingContactFields: APPLE_PAY_REQUIRED_CONTACT_FIELDS,
      requiredShippingContactFields: APPLE_PAY_REQUIRE_SHIPPING_CONTACT
        ? APPLE_PAY_REQUIRED_CONTACT_FIELDS
        : [],
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

      console.debug(session);
      return session;
    } catch (error) {
      console.error('Error validating merchant:', error);
      throw error;
    }
  }

  async function onSubmitGooglePay(amount: number) {
    cartAmount.current = amount;
  }

  async function onGooglePayPaymentAuthorized(google_pay: any) {
    try {
      if (!submitting) {
        setSubmitting(true);

        const googlePayToken = google_pay.paymentMethodData;
        const googlePay = await createGooglePay(googlePayToken);

        if (googlePay) {
          const walletBillingAddress = google_pay.paymentMethodData?.info?.billingAddress;
          const billingDetails = walletBillingAddress && {
            address_line_1: walletBillingAddress.address1,
            address_line_2: walletBillingAddress.address2 || undefined,
            city: walletBillingAddress.locality,
            state: walletBillingAddress.administrativeArea,
            postal_code: walletBillingAddress.postalCode,
            country: walletBillingAddress.countryCode,
          };

          const intent = await createPaymentIntent(
            cartAmount.current,
            { google_pay: googlePay.id },
            billingDetails,
          );

          if (intent?.id) {
            const paymentIntent = await confirmPaymentIntent(intent.id, {});
            if (paymentIntent?.payment_id) {
              router.push(`/ecommerce/orders/${paymentIntent.payment_id}/summary`);
            }
          }
        } else {
          console.error('Google Pay payment method creation failed');
        }

        setSubmitting(false);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function createGooglePay(
    googlePaymentMethodData: PublicSquareTypes.GooglePaymentMethodData,
  ) {
    const psq = publicsquareRef.current;
    if (psq) {
      try {
        const response = await psq.googlePay.create({
          google_payment_method_data: googlePaymentMethodData,
        });
        if (response) {
          return response;
        }
      } catch (error) {
        console.error(error);
      }
    }
  }

  async function onSubmitThreeDsElement(
    amount: number,
    values: {
      name_on_card: string;
      amount: number;
      customer: any;
      address: any;
    },
    threeDsElement: RefObject<PublicSquareTypes.CardElement | null>,
  ) {
    try {
      if (threeDsElement.current && !submitting) {
        setSubmitting(true);
        const card = await createCard(values, threeDsElement.current, 'TEST');
        if (!card) return;
        console.debug('createCard: ', card);

        const intent = await createPaymentIntent(amount, { card: card.id });
        if (!intent?.id) return;

        const session = await createThreeDsSession(card.token, intent.id, 'no-preference');
        if (!session?.id) return;
        console.debug('createThreeDsSession: ', session);

        const paymentIntentModel = await confirmPaymentIntent(intent.id, {
          three_d_secure: { session_id: session.id, transport: 'iframe' },
        });
        console.debug('confirmPaymentIntent: ', paymentIntentModel);

        setSubmitting(false);
        return { ...paymentIntentModel, btSessionId: session.bt_session_id };
      }
    } catch (error) {
      console.error(error);
    }
    setSubmitting(false);
  }

  async function completeThreeDsPaymentIntent(
    paymentIntentId: string,
    body: CompletePaymentIntentRequest,
  ): Promise<PaymentIntentModel> {
    const response = await fetch(
      `/api/payment-intents/${paymentIntentId}/three_d_secure/complete`,
      {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
      },
    );
    return response.json();
  }

  async function confirmPaymentIntent(
    paymentIntentId: string,
    body: ConfirmPaymentIntentRequest,
  ): Promise<PaymentIntentModel> {
    const response = await fetch(`/api/payment-intents/${paymentIntentId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  async function createThreeDsSession(
    tokenId: string,
    paymentIntentId: string,
    challengePreference: string,
  ) {
    if (publicsquare) {
      try {
        const response = await publicsquare.threeDs.createSession({
          token_id: tokenId,
          payment_intent_id: paymentIntentId,
          challenge_preference: challengePreference,
          environment: 'TEST',
        });
        if (response) {
          return response as { id: string; bt_session_id: string; acs_transaction_id: string };
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  }

  async function createPaymentIntent(
    amount: number,
    paymentMethod: { card?: string; google_pay?: string },
    billingDetails?: {
      address_line_1?: string;
      address_line_2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    },
  ): Promise<PaymentIntentModel> {
    const response = await fetch('/api/payment-intents', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethod, billingDetails }),
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  }

  return {
    createCard,
    createPaymentIntent,
    createThreeDsSession,
    confirmPaymentIntent,
    completeThreeDsPaymentIntent,
    submitting,
    onSubmitCardElement,
    onSubmitThreeDsElement,
    onSubmitBankAccountElement,
    onSubmitBankAccountVerificationElement,
    onSubmitApplePay,
    onSubmitGooglePay,
    onGooglePayPaymentAuthorized,
  };
}
