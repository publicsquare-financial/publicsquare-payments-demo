'use client'

import { useRef } from 'react'
import PublicSquareTypes from '@publicsquare/elements-react/types'
import { ErrorMessage, Form, Formik } from 'formik'
import * as Yup from 'yup'
import { PublicSquareProvider } from '@publicsquare/elements-react'
import CustomerSelect from '@/components/form/CustomerSelect'
import AddressSelect from '@/components/form/AddressSelect'
import Button from '@/components/Button'
import PaymentMethodTabs from '@/components/PaymentMethodTabs'
import { PaymentMethodEnum } from '@/utils'
import FormInput from '@/components/form/FormInput'
import { useCheckoutSubmit } from '@/hooks/useCheckoutSubmit'

export default function Page() {
  return (
    <PublicSquareProvider
      apiKey={process.env.NEXT_PUBLIC_PUBLICSQUARE_API_KEY!}
    >
      <div className="mx-auto max-w-7xl py-12 space-y-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Admin</h1>
        <PayoutCard />
      </div>
    </PublicSquareProvider>
  )
}

function PayoutCard() {
  const cardElement = useRef<PublicSquareTypes.CardElement>(null)
  const bankAccountElement = useRef<PublicSquareTypes.BankAccountElement>(null)
  const { onSubmitCardElement, onSubmitBankAccountElement, submitting } =
    useCheckoutSubmit()

  const schema = Yup.object().shape({
    amount: Yup.number().required('Amount is required'),
    customer: Yup.object({
      email: Yup.string().email().required('Email is required'),
      first_name: Yup.string().required('First name is required'),
      last_name: Yup.string().required('Last name is required'),
      business_name: Yup.string(),
      phone: Yup.string()
        .max(12, 'Phone can only be 12 characters max, including country code.')
        .min(11, 'Phone can only be 11 characters min, including country code.')
        .required('Phone is required'),
    }),
    address: Yup.object({
      address_line_1: Yup.string().required('Address line 1 is required'),
      address_line_2: Yup.string(),
      city: Yup.string().required('City is required'),
      state: Yup.string()
        .max(3, 'State can only be 3 characters')
        .min(2, 'State is the 2 or 3 character state code')
        .required('State is required'),
      postal_code: Yup.string().required('Postal code is required'),
      country: Yup.string()
        .length(
          2,
          'Country is the 2 character ISO country code (e.g. United States => "US")'
        )
        .required('Country is required'),
    }).required('Address is required'),
    delivery_method: Yup.number().required('Delivery method is required'),
    name_on_card: Yup.string().required('Name on card is required'),
    payment_method: Yup.string()
      .required('Payment method is required')
      .oneOf([PaymentMethodEnum.CREDIT_CARD, PaymentMethodEnum.BANK_ACCOUNT]),
  })

  const initialValues: Yup.InferType<typeof schema> = {
    customer: {
      email: 'example@publicsquare.com',
      first_name: 'John',
      last_name: 'Joe',
      business_name: '',
      phone: '11234567890',
    },
    address: {
      address_line_1: '1100 S Ocean Blvd',
      address_line_2: undefined,
      city: 'Palm Beach',
      state: 'FL',
      postal_code: '33480',
      country: 'US',
    },
    delivery_method: 1,
    name_on_card: 'John Joe',
    amount: '' as any,
    payment_method: PaymentMethodEnum.CREDIT_CARD,
  }

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900">
        Send payouts to customers
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={schema}
        onSubmit={(values, { setFieldError }) => {
          if (values.payment_method === PaymentMethodEnum.CREDIT_CARD) {
            if (!cardElement.current) {
              setFieldError('card', 'Card is required')
            } else {
              onSubmitCardElement(
                values.amount * 100,
                values,
                cardElement,
                'payout'
              ).then((payment) => {
                if (payment.id) {
                  alert(`Payout successfully sent ${payment.id}`)
                }
              })
            }
          } else if (values.payment_method === PaymentMethodEnum.BANK_ACCOUNT) {
            if (!bankAccountElement.current) {
              setFieldError('bank_account', 'Bank account is required')
            } else {
              onSubmitBankAccountElement(
                values.amount * 100,
                values,
                bankAccountElement,
                'payout'
              ).then((payment) => {
                if (payment.id) {
                  alert(`Payout successfully sent ${payment.id}`)
                }
              })
            }
          }
        }}
      >
        {(formik) => (
          <Form
            className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm"
            data-testid="checkout-form"
          >
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
              <h2 className="text-lg font-medium text-gray-900">
                1. Select recipient
              </h2>
              <CustomerSelect formik={formik} />
              <ErrorMessage name="customer" />
              <hr />
              <h3 className="text-md font-medium text-gray-900">
                2. Select your payment method
              </h3>
              <PaymentMethodTabs
                formik={formik}
                cardElement={cardElement}
                bankAccountElement={bankAccountElement}
              />
              <ErrorMessage name="payment_method" />
              <hr />
              <h3 className="text-md font-medium text-gray-900">
                3. Select your billing address
              </h3>
              <AddressSelect formik={formik} />
              <ErrorMessage name="address" />
              <hr />
              <h3 className="text-md font-medium text-gray-900">
                4. Select your payout amount
              </h3>
              <div className="mt-1">
                <FormInput
                  name="amount"
                  onChange={formik.handleChange}
                  type="number"
                  placeholder="Amount in dollars"
                />
              </div>
              <hr />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="max-w-sm"
                  loading={submitting}
                  disabled={submitting}
                >
                  Send payout
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}
