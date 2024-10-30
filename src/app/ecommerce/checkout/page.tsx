'use client';

import { useMemo, useRef, useState } from 'react';
import { Radio, RadioGroup } from '@headlessui/react';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/20/solid';
import {
  CardElement,
  PublicSquareProvider,
  usePublicSquare,
} from '@publicsquare/elements-react';
import * as Yup from 'yup';
import { ErrorMessage, Form, Formik } from 'formik';
import FormInput from '@/components/form/FormInput';
import FormSelect from '@/components/form/FormSelect';
import PublicSquareTypes from '@publicsquare/elements-js/types/sdk';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useCart } from '@/providers/CartProvider';
import { currency } from '@/utils';
import CardElementsCallout from '@/components/ecommerce/CardElementsCallout';
import ConfirmOrderCallout from '@/components/ecommerce/ConfirmOrderCallout';

const deliveryMethods = [
  {
    id: 1,
    title: 'Standard',
    turnaround: '4–10 business days',
    price: '$5.00',
  },
  { id: 2, title: 'Express', turnaround: '2–5 business days', price: '$16.00' },
];
const paymentMethods = [
  { id: 'credit-card', title: 'Credit card' },
  // { id: 'ach', title: 'ACH' },
]

function Component() {
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  )
  const cardElement = useRef<PublicSquareTypes.CardElement>(null)
  const [loading, setLoading] = useState(false)
  const { publicsquare } = usePublicSquare()
  const cart = useCart()
  const total = useMemo(() => {
    const subtotal = cart.items.reduce(
      (accum, cur) => accum + cur.item.price * cur.quantity,
      0
    )
    return {
      subtotal,
      shipping: 5,
      taxes: 0.07 * subtotal,
      total: subtotal + 0.07 * subtotal,
    }
  }, [cart.items])
  const router = useRouter()

  const schema = Yup.object().shape({
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
    card: Yup.object().required('Card is required'),
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
    card: {},
  }

  async function onSubmitCardElement(values: typeof initialValues) {
    try {
      if (cardElement.current && !loading) {
        setLoading(true)
        const card = await createCard(values, cardElement.current)
        if (card) {
          const payment = await capturePayment(values, card)
          if (payment.id) {
            router.push(`/ecommerce/orders/${payment.id}/summary`)
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
    setLoading(false)
  }

  async function createCard(
    values: typeof initialValues,
    card: PublicSquareTypes.CardsCreateInput['card']
  ) {
    if (values.name_on_card && card && publicsquare) {
      try {
        const response = await publicsquare.cards.create({
          cardholder_name: values.name_on_card,
          card,
        })
        if (response) {
          return response
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  async function capturePayment(
    values: typeof initialValues,
    card: PublicSquareTypes.CardCreateResponse
  ) {
    try {
      const payment = await fetch('/api/payments', {
        method: 'POST',
        body: JSON.stringify({
          // amount should be in cents rather than dollars
          amount: total.total * 100,
          // optional, USD is assumed
          currency: 'USD',
          payment_method: {
            card: card.id,
          },
          customer: values.customer,
          billing_details: values.address,
        }),
      }).then((res) => res.json())
      return payment
    } catch (error) {}
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (values, { setSubmitting, setFieldError }) => {
        if (!cardElement.current) {
          setFieldError('card', 'Card is required')
        } else {
          setSubmitting(true)
          onSubmitCardElement(values)
          setSubmitting(false)
        }
      }}
    >
      {(formik) => (
        <Form
          className="flex flex-col space-y-8 divide-gray-200"
          data-testid="checkout-form"
        >
          <div className="bg-gray-50">
            <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
              <h2 className="sr-only">Checkout</h2>

              <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
                <div>
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      Contact information
                    </h2>

                    <div className="mt-4">
                      <label
                        htmlFor="customer.email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email address
                      </label>
                      <div className="mt-1">
                        <FormInput
                          name="customer.email"
                          type="email"
                          onChange={formik.handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">
                      Shipping information
                    </h2>

                    <div className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                      <div>
                        <label
                          htmlFor="customer.first_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          First name
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="customer.first_name"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="customer.last_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Last name
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="customer.last_name"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="customer.business_name"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Company
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="customer.business_name"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="address"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Address
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="address.address_line_1"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="apartment"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Apartment, suite, etc.
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="address.address_line_2"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium text-gray-700"
                        >
                          City
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="address.city"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="country"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Country
                        </label>
                        <div className="mt-1">
                          <FormSelect
                            name="address.country"
                            options={[
                              { value: 'US', name: 'United States' },
                              { value: 'MX', name: 'Mexico ' },
                              { value: 'CN', name: 'Canada' },
                            ]}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="region"
                          className="block text-sm font-medium text-gray-700"
                        >
                          State / Province
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="address.state"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="postalCode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Postal code
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="address.postal_code"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="customer.phone"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Phone
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="customer.phone"
                            type="tel"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <fieldset>
                      <legend className="text-lg font-medium text-gray-900">
                        Delivery method
                      </legend>
                      <RadioGroup
                        value={selectedDeliveryMethod}
                        onChange={setSelectedDeliveryMethod}
                        className="mt-4 grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4"
                      >
                        {deliveryMethods.map((deliveryMethod) => (
                          <Radio
                            key={deliveryMethod.id}
                            value={deliveryMethod}
                            aria-label={deliveryMethod.title}
                            aria-description={`${deliveryMethod.turnaround} for ${deliveryMethod.price}`}
                            className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-transparent data-[focus]:ring-2 data-[focus]:ring-primary"
                          >
                            <span className="flex flex-1">
                              <span className="flex flex-col">
                                <span className="block text-sm font-medium text-gray-900">
                                  {deliveryMethod.title}
                                </span>
                                <span className="mt-1 flex items-center text-sm text-gray-500">
                                  {deliveryMethod.turnaround}
                                </span>
                                <span className="mt-6 text-sm font-medium text-gray-900">
                                  {deliveryMethod.price}
                                </span>
                              </span>
                            </span>
                            <CheckCircleIcon
                              aria-hidden="true"
                              className="h-5 w-5 text-primary-dark [.group:not([data-checked])_&]:hidden"
                            />
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-primary"
                            />
                          </Radio>
                        ))}
                      </RadioGroup>
                    </fieldset>
                  </div>

                  {/* Payment */}
                  <div className="mt-10 border-t border-gray-200 pt-10">
                    <h2 className="text-lg font-medium text-gray-900">
                      Payment
                    </h2>

                    <fieldset className="mt-4">
                      <legend className="sr-only">Payment type</legend>
                      <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
                        {paymentMethods.map(
                          (paymentMethod, paymentMethodIdx) => (
                            <div
                              key={paymentMethod.id}
                              className="flex items-center"
                            >
                              {paymentMethodIdx === 0 ? (
                                <input
                                  defaultChecked
                                  id={paymentMethod.id}
                                  name="payment-type"
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 text-primary-dark focus:ring-primary"
                                />
                              ) : (
                                <input
                                  id={paymentMethod.id}
                                  name="payment-type"
                                  type="radio"
                                  className="h-4 w-4 border-gray-300 text-primary-dark focus:ring-primary"
                                />
                              )}

                              <label
                                htmlFor={paymentMethod.id}
                                className="ml-3 block text-sm font-medium text-gray-700"
                              >
                                {paymentMethod.title}
                              </label>
                            </div>
                          )
                        )}
                      </div>
                    </fieldset>

                    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
                      <div className="col-span-4">
                        <label
                          htmlFor="name_on_card"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Name on card
                        </label>
                        <div className="mt-1">
                          <FormInput
                            name="name_on_card"
                            onChange={formik.handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-span-4 relative">
                        <div
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm py-1"
                          {...{
                            type: 'text',
                          }}
                        >
                          <CardElement ref={cardElement} id="card-element" />
                        </div>
                        <ErrorMessage name="card" />
                        <CardElementsCallout />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order summary */}
                <div className="mt-10 lg:mt-0">
                  <h2 className="text-lg font-medium text-gray-900">
                    Order summary
                  </h2>

                  <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                    <h3 className="sr-only">Items in your cart</h3>
                    <ul role="list" className="divide-y divide-gray-200">
                      {cart.items.map((product) => (
                        <li
                          key={product.item.id}
                          className="flex px-4 py-6 sm:px-6"
                        >
                          <div className="flex-shrink-0">
                            <img
                              alt={product.item.imageAlt}
                              src={product.item.images[0]}
                              className="w-20 rounded-md"
                            />
                          </div>

                          <div className="ml-6 flex flex-1 flex-col">
                            <div className="flex">
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm">
                                  <a
                                    href={`/ecommerce/products/${product.item.slug}`}
                                    className="font-medium text-gray-700 hover:text-gray-800"
                                  >
                                    {product.item.name}
                                  </a>
                                </h4>
                                <p className="mt-1 text-sm text-gray-500">
                                  {product.item.shortDescription}
                                </p>
                                <p className="mt-1 text-sm text-gray-500">
                                  {product.item.options}
                                </p>
                              </div>

                              <div className="ml-4 flow-root flex-shrink-0">
                                <button
                                  type="button"
                                  className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                                  onClick={() =>
                                    cart.setItems(
                                      cart.items.filter(
                                        (cur) => cur.item.id !== product.item.id
                                      )
                                    )
                                  }
                                >
                                  <span className="sr-only">Remove</span>
                                  <TrashIcon
                                    aria-hidden="true"
                                    className="h-5 w-5"
                                  />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-1 items-end justify-between pt-2">
                              <p className="mt-1 text-sm font-medium text-gray-900">
                                {currency(product.item.price)}
                              </p>

                              <div className="ml-4">
                                <label htmlFor="quantity" className="sr-only">
                                  Quantity
                                </label>
                                <select
                                  value={product.quantity}
                                  id="quantity"
                                  name="quantity"
                                  className="rounded-md border border-gray-300 text-left text-base font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                                  onChange={formik.handleChange}
                                >
                                  <option value={1}>1</option>
                                  <option value={2}>2</option>
                                  <option value={3}>3</option>
                                  <option value={4}>4</option>
                                  <option value={5}>5</option>
                                  <option value={6}>6</option>
                                  <option value={7}>7</option>
                                  <option value={8}>8</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Subtotal</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {currency(total.subtotal)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Shipping</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {currency(total.shipping)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between">
                        <dt className="text-sm">Taxes</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {currency(total.taxes)}
                        </dd>
                      </div>
                      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                        <dt className="text-base font-medium">Total</dt>
                        <dd className="text-base font-medium text-gray-900">
                          {currency(total.total)}
                        </dd>
                      </div>
                    </dl>

                    <div className="border-t border-gray-200 px-4 py-6 sm:px-6 relative">
                      <Button
                        type="submit"
                        loading={loading}
                        disabled={loading}
                      >
                        Confirm order
                      </Button>
                      <ConfirmOrderCallout />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default function Page() {
  return (
    <PublicSquareProvider
      apiKey={process.env.NEXT_PUBLIC_PUBLICSQUARE_API_KEY!}
    >
      <Component />
    </PublicSquareProvider>
  )
}