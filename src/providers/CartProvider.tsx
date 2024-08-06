'use client'
import config from '@config'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

type ProviderValue = {
  customer: any
  items: {
    item: (typeof config.products)[0]
    quantity: number
  }[]
  billingDetails: any
}

type ProviderFunctions = {
  setItems: (data: ProviderValue['items']) => void
  setCustomer: (data: ProviderValue['customer']) => void
  setBillingDetails: (data: ProviderValue['billingDetails']) => void
}

const Context = createContext<ProviderValue & ProviderFunctions>({} as any)

type CredovaProviderProps = {}

export const CartProvider = ({
  children,
}: PropsWithChildren<CredovaProviderProps>) => {
  const [customer, _setCustomer] = useState<ProviderValue['customer']>()
  const [items, _setItems] = useState<ProviderValue['items']>([])
  const [billingDetails, _setBillingDetails] =
    useState<ProviderValue['billingDetails']>()

  function createCart(data: object) {
    return {
      customer,
      items,
      billingDetails,
      ...data,
    }
  }

  function setItems(data: typeof items) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'cart',
        JSON.stringify(createCart({ items: data }))
      )
    }
    _setItems(data)
  }

  function setCustomer(data: typeof customer) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'cart',
        JSON.stringify(createCart({ customer: data }))
      )
    }
    _setCustomer(data)
  }

  function setBillingDetails(data: typeof billingDetails) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'cart',
        JSON.stringify(createCart({ billingDetails: data }))
      )
    }
    _setBillingDetails(data)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.localStorage.getItem('cart')) {
        const data = JSON.parse(window.localStorage.getItem('cart') as any)
        _setCustomer(data.customer)
        _setItems(data.items ?? [])
        _setBillingDetails(data.billing_details)
      }
    }
  }, [])

  return (
    <Context.Provider
      value={{
        items,
        setItems,
        customer,
        setCustomer,
        billingDetails,
        setBillingDetails,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useCart = () => useContext(Context)
