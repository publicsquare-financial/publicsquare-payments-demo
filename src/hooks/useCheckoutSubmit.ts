import { usePublicSquare } from '@publicsquare/elements-react'
import PublicSquareTypes from '@publicsquare/elements-react/types'
import { useRouter } from 'next/navigation'
import { RefObject, useState } from 'react'

export function useCheckoutSubmit() {
  const { publicsquare } = usePublicSquare()
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  async function onSubmitCardElement(
    amount: number,
    values: {
      name_on_card: string
      amount: number
      customer: any
      address: any
    },
    cardElement: RefObject<PublicSquareTypes.CardElement | null>,
    type: 'payment' | 'payout' = 'payment'
  ) {
    try {
      if (cardElement.current && !submitting) {
        setSubmitting(true)
        const card = await createCard(values, cardElement.current)
        if (card) {
          const payment = await capturePayment(amount, values, { card }, type)
          return payment
        }
      }
    } catch (error) {
      console.log(error)
    }
    setSubmitting(false)
  }

  async function createCard(
    values: { name_on_card: string },
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
    amount: number,
    values: { amount: number; customer: any; address: any },
    {
      card,
      bankAccount,
    }: {
      card?: PublicSquareTypes.CardCreateResponse
      bankAccount?: PublicSquareTypes.BankAccountCreateResponse
    },
    type: 'payment' | 'payout' = 'payment'
  ) {
    try {
      const payment = await fetch(`/api/${type}s`, {
        method: 'POST',
        body: JSON.stringify({
          // amount should be in cents rather than dollars
          amount,
          // optional, USD is assumed
          currency: 'USD',
          payment_method: {
            ...(card && { card: card.id }),
            ...(bankAccount && { bank_account: bankAccount.id }),
          },
          customer: values.customer,
          billing_details: values.address,
        }),
      }).then((res) => res.json())
      return payment
    } catch (error) {}
  }

  async function onSubmitBankAccountElement(
    amount: number,
    values: any,
    bankAccountElement: RefObject<PublicSquareTypes.BankAccountElement | null>,
    type: 'payment' | 'payout' = 'payment'
  ) {
    try {
      if (bankAccountElement.current && !submitting) {
        setSubmitting(true)
        const bankAccount = await createBankAccount(values, bankAccountElement)
        if (bankAccount) {
          const payment = await capturePayment(
            amount,
            values,
            { bankAccount },
            type
          )
          return payment
        }
      }
    } catch (error) {
      console.log(error)
    }
    setSubmitting(false)
  }

  async function createBankAccount(values: any, bankAccountElement: any) {
    if (
      values.name_on_card &&
      bankAccountElement.current?.routingNumber.el.value &&
      bankAccountElement.current?.accountNumber.el.value &&
      publicsquare
    ) {
      try {
        const response = await publicsquare.bankAccounts.create({
          account_holder_name: values.name_on_card,
          routing_number: bankAccountElement.current?.routingNumber.el.value,
          account_number: bankAccountElement.current?.accountNumber.el.value,
        })
        if (response) {
          return response
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  return {
    createCard,
    onSubmitCardElement,
    submitting,
    onSubmitBankAccountElement,
  }
}
