import { RefObject } from 'react'
import { ErrorMessage } from 'formik'
import { BankAccountElement } from '@publicsquare/elements-react'
import FormInput from './FormInput'
import CardElementsCallout from '../ecommerce/CardElementsCallout'
import PublicSquareTypes from '@publicsquare/elements-react/types'

export default function BankAccountElementForm({
  formik,
  ref,
}: {
  formik: any
  ref: RefObject<PublicSquareTypes.BankAccountElement | null>
}) {
  return (
    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
      <div className="col-span-4">
        <label
          htmlFor="account_holder_name"
          className="block text-sm font-medium text-gray-700"
        >
          Account holder name
        </label>
        <div className="mt-1">
          <FormInput
            name="account_holder_name"
            onChange={formik.handleChange}
            placeholder="Account holder name"
            value={formik.values.account_holder_name}
          />
        </div>
      </div>
      <div className="col-span-4 relative">
        <label
          htmlFor="bank_account"
          className="block text-sm font-medium text-gray-700"
        >
          Bank account
        </label>
        <div className="mt-1 block w-full rounded-md border overflow-hidden border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
          <BankAccountElement
            ref={ref}
            id="bank-account-element"
            routingNumberOptions={{
              placeholder: 'Routing number',
              className: 'border-0 focus:ring-0 sm:text-sm py-1 w-full py-2',
            }}
            accountNumberOptions={{
              placeholder: 'Account number',
              className: 'border-0 focus:ring-0 sm:text-sm py-1 w-full py-2',
            }}
          />
        </div>
        <ErrorMessage name="card" />
        <CardElementsCallout />
      </div>
    </div>
  )
}
