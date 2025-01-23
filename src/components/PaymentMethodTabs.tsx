import { availablePaymentMethods } from '@/utils'
import { FormikProps } from 'formik'
import CardElementForm from './form/CardElementForm'
import BankAccountElementForm from './form/BankAccountElementForm'
import PublicSquareTypes from '@publicsquare/elements-react/types'

export default function PaymentMethodTabs({
  formik,
  cardElement,
  bankAccountElement,
}: {
  formik: FormikProps<any>
  cardElement: React.RefObject<PublicSquareTypes.CardElement | null>
  bankAccountElement: React.RefObject<PublicSquareTypes.BankAccountElement | null>
}) {
  return (
    <div>
      <fieldset className="mt-4">
        <legend className="sr-only">Payment type</legend>
        <div className="space-y-4 sm:flex sm:items-center sm:space-x-10 sm:space-y-0">
          {availablePaymentMethods.map((paymentMethod, paymentMethodIdx) => (
            <div key={paymentMethod.id} className="flex items-center">
              {paymentMethodIdx === 0 ? (
                <input
                  defaultChecked
                  id={paymentMethod.id}
                  name="payment-type"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-primary-dark focus:ring-primary"
                  onChange={() =>
                    formik.setFieldValue('payment_method', paymentMethod.id)
                  }
                />
              ) : (
                <input
                  id={paymentMethod.id}
                  name="payment-type"
                  type="radio"
                  className="h-4 w-4 border-gray-300 text-primary-dark focus:ring-primary"
                  onChange={() =>
                    formik.setFieldValue('payment_method', paymentMethod.id)
                  }
                />
              )}

              <label
                htmlFor={paymentMethod.id}
                className="ml-3 block text-sm font-medium text-gray-700"
              >
                {paymentMethod.title}
              </label>
            </div>
          ))}
        </div>
      </fieldset>

      {formik.values.payment_method === 'credit-card' && (
        <CardElementForm formik={formik} ref={cardElement} />
      )}
      {formik.values.payment_method === 'ach' && (
        <BankAccountElementForm formik={formik} ref={bankAccountElement} />
      )}
    </div>
  )
}
