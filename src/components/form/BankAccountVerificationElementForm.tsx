import { RefObject } from 'react';
import { ErrorMessage } from 'formik';
import { BankAccountVerificationElement } from '@publicsquare/elements-react';
import BankAccountVerificationElementsCallout from '../ecommerce/BankAccountVerificationElementsCallout';
import PublicSquareTypes from '@publicsquare/elements-react/types';

export default function BankAccountVerificationElementForm({
  formik,
  ref,
}: {
  formik: any;
  ref: RefObject<PublicSquareTypes.BankAccountVerificationElement | null>;
}) {
  return (
    <div className="mt-6 grid grid-cols-4 gap-x-4 gap-y-6">
      <div className="relative col-span-4">
        <div className="mt-1 block w-full overflow-hidden rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
          <BankAccountVerificationElement
            ref={ref}
            id="bank-account-element"
            className="space-x-4"
            onVerificationComplete={(result) => {
              console.log('Bank account verification completed:', result);
              formik.setFieldValue(
                'bank_account_verification_id',
                result.bank_account_verification_id,
              );
            }}
          />
        </div>
        <ErrorMessage name="bank_account_verification_id" />
        <BankAccountVerificationElementsCallout />
      </div>
    </div>
  );
}
