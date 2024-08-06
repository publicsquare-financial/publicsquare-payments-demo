import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import CodeCallout from '../CodeCallout'

export default function ConfirmOrderCallout() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="absolute right-4 top-4 shadow-md shadow-slate-500 rounded-full text-white bg-slate-900"
      >
        <QuestionMarkCircleIcon className="w-5 h-5" />
      </button>
      <CodeCallout
        title="Capture order payment snippets"
        description="The following code will give you the api calls to capture payment for an order:"
        code={`
// ...
// Step 1: Create the card
// See https://developers.credova.com/guides/merchants/collect-cards#storing-cards
const response = await credova.cards.create({
  cardholder_name: values.name_on_card,
  // This is the card element ref
  card,
})
// Step 2: Capture the payment
// See https://developers.credova.com/guides/merchants/process-payments#process-the-payment
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
// Step 3: Redirect to thank you page and other post sale actions
// ...
`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
