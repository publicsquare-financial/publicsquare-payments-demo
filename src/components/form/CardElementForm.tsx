import { CardElement } from '@publicsquare/elements-react';
import FormInput from './FormInput';
import CardElementsCallout from '../ecommerce/CardElementsCallout';
import { ErrorMessage } from 'formik';
import { RefObject } from 'react';
import PublicSquareTypes from '@publicsquare/elements-react/types';

export default function CardElementForm({
  formik,
  ref,
}: {
  formik: any;
  ref: RefObject<PublicSquareTypes.CardElement | null>;
}) {
  return (
    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
      <div className="col-span-4">
        <label htmlFor="name_on_card" className="block text-sm font-medium text-gray-700">
          Name on card
        </label>
        <div className="mt-1">
          <FormInput name="name_on_card" onChange={formik.handleChange} />
        </div>
      </div>
      <div className="relative col-span-4">
        <div
          className="block w-full rounded-md border-gray-300 py-1 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          {...{
            type: 'text',
          }}
        >
          <CardElement ref={ref} id="card-element" />
        </div>
        <ErrorMessage name="card" />
        <CardElementsCallout />
      </div>
    </div>
  );
}
