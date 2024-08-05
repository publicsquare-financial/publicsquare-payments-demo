import config from '@config'
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

type ProviderValue = {
  items: {
    item: (typeof config.products)[0]
    quantity: number
  }[]
}

type ProviderFunctions = {
  setItems: (items: ProviderValue['items']) => void
}

const Context = createContext<ProviderValue & ProviderFunctions>({} as any)

type CredovaProviderProps = {}

export const CartProvider = ({
  children,
}: PropsWithChildren<CredovaProviderProps>) => {
  const [items, _setItems] = useState<ProviderValue['items']>([])

  function setItems(data: typeof items) {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('cartItems', JSON.stringify(data))
    }
    _setItems(data)
  }

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.localStorage.getItem('cartItems')
    ) {
      _setItems(JSON.parse(window.localStorage.getItem('cartItems') as any))
    }
  }, [])

  return (
    <Context.Provider
      value={{
        items,
        setItems,
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useCart = () => useContext(Context)
