import { ErrorMessage } from "formik";
import ApplePayButtonElement from "@publicsquare/elements-react/elements/ApplePayButtonElement";
import { usePublicSquare } from "@publicsquare/elements-react";

declare global {
  interface Window {
    ApplePaySession: any;
  }
}

export default function ApplePayElementForm({ total }: { total: number }) {
  const { publicsquare } = usePublicSquare();

  function createApplePaySession() {
    return new window.ApplePaySession(3, {
      countryCode: "US",
      currencyCode: "USD",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard", "amex", "discover"],
      total: {
        label: "PublicSquare Payments Demo",
        type: "final",
        amount: total.toString(),
      },
    });
  }

  async function validateMerchant() {
    try {
      const session = await publicsquare?.applePay.createSession({
        display_name: "PublicSquare Payments Demo",
        domain: window.location.host,
      });

      console.log(session);
      return session;
    } catch (error) {
      console.error("Error validating merchant:", error);
      throw error;
    }
  }

  async function createPaymentMethod(event: any) {
    console.log("Apple Pay token", event.payment.token);

    const paymentMethod = await publicsquare?.applePay.create({
      apple_payment_data: event.payment.token,
    });

    console.log("PSQ Apple Pay payment method", paymentMethod);
    return paymentMethod;
  }

  function onApplePayButtonClicked() {
    if (!window.ApplePaySession) {
      return;
    }

    const session = createApplePaySession();

    session.onvalidatemerchant = async () => {
      const merchantSession = await validateMerchant();
      session.completeMerchantValidation(merchantSession);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session.onpaymentauthorized = async (event: any) => {
      try {
        // decrypt and tokenize Apple Pay
        await createPaymentMethod(event);
        // present green check to the user before the timeout (30 seconds)
        session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
      } catch (e) {
        console.error(e);
        session.completePayment(window.ApplePaySession.STATUS_FAILURE);
      }
    };

    session.begin();
  }

  return (
    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
      <div className="col-span-4 relative">
        <ApplePayButtonElement
          id="apple-pay-element"
          onClick={onApplePayButtonClicked}
        />
        <ErrorMessage name="apple-pay" />
        {/* <ApplePayElementsCallout /> */}
      </div>
    </div>
  );
}
