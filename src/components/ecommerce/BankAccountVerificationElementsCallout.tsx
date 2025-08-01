import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import CodeCallout from '../CodeCallout';

export default function BankAccountVerificationElementsCallout() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute -right-2 -top-2 rounded-full bg-slate-900 text-white shadow-md shadow-slate-500"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>
      <CodeCallout
        title="Render PublicSquare Bank Account Verification form snippet"
        description="The following code will give you the bank account verification form you see on the checkout page:"
        code={`import React, { useRef } from 'react';
import {
  PublicSquareProvider,
  BankAccountVerificationElement,
  usePublicSquare,
} from '@publicsquare/elements-react';

function Component() {
  const { publicsquare } = usePublicSquare();
  // Refs to get access to the Elements instance
  const bankAccountVerificationElementRef = useRef(null);

  return (
      <BankAccountVerificationElement
        id="bankAccountVerificationElement"
        ref={bankAccountVerificationElementRef}
        onVerificationComplete={(result) => {
          console.log('Bank account verification completed:', result.bank_account_verification_id);
        }}
      />
  );
}

export default function App() {
  return (
    <PublicSquareProvider apiKey={apiKey}>
      <Component />
    </PublicSquareProvider>
  );
}
`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
