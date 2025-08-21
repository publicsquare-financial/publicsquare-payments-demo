import { useEffect, useRef } from 'react';

export default function GooglePayButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let paymentsClient: any;
    const baseRequest = {
      apiVersion: 2,
      apiVersionMinor: 0,
    };
    const tokenizationSpecification = {
      type: 'PAYMENT_GATEWAY',
      parameters: {
        gateway: 'basistheory',
        gatewayMerchantId: '2fff47ed-5759-4253-bf0e-fd56fbc20288', // TODO: Get tenant ID from API
      },
    };
    const allowedCardNetworks = ['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA'];
    const allowedCardAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
    const baseCardPaymentMethod = {
      type: 'CARD',
      parameters: {
        allowedAuthMethods: allowedCardAuthMethods,
        allowedCardNetworks: allowedCardNetworks,
      },
    };

    async function onGooglePayLoaded() {
      paymentsClient = new (window as any).google.payments.api.PaymentsClient({
        environment: 'TEST',
      });
      const isReadyToPayRequest = Object.assign({}, baseRequest, {
        allowedPaymentMethods: [baseCardPaymentMethod],
      });
      try {
        const response = await paymentsClient.isReadyToPay(isReadyToPayRequest);
        if (response.result) {
          createAndAddButton();
        } else {
          console.error('Google Pay is not available.');
        }
      } catch (error) {
        console.error('Error checking readiness:', error);
      }
    }

    function createAndAddButton() {
      if (!paymentsClient || !containerRef.current) return;
      const button = paymentsClient.createButton({
        onClick: onGooglePaymentButtonClicked,
      });
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(button);
    }

    async function onGooglePaymentButtonClicked() {
      const paymentDataRequest = Object.assign({}, baseRequest, {
        allowedPaymentMethods: [
          Object.assign({}, baseCardPaymentMethod, {
            tokenizationSpecification: tokenizationSpecification,
          }),
        ],
        transactionInfo: {
          totalPriceStatus: 'FINAL',
          totalPrice: '105.00', // TODO: Replace with dynamic price if needed
          currencyCode: 'USD',
        },
        merchantInfo: {
          merchantName: 'Example Merchant', // TODO: Replace with your merchant name
          //merchantId: 'ABC123',
        },
      });

      try {
        const paymentData = await paymentsClient.loadPaymentData(paymentDataRequest);
        console.log('Payment data:', paymentData);
      } catch (error) {
        console.error('Error loading payment data:', error);
      }
    }

    // Load Google Pay script
    const script = document.createElement('script');
    script.src = 'https://pay.google.com/gp/p/js/pay.js';
    script.async = true;
    script.onload = onGooglePayLoaded;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  return (
    <div>
      <h1>Google Pay Integration</h1>
      <div ref={containerRef} id="container"></div>
    </div>
  );
}
