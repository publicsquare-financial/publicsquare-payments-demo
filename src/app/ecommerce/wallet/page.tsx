'use client'

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

export default function Page() {
  const [cards, setCards] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/cards')
      .then((res) => res.json())
      .then((data) => setCards(data.data))
  }, [])

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8 space-y-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Customer Wallet
        </h1>
        <ul
          role="list"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
        >
          {cards.map((card) => (
            <li key={card.id}>
              <div className="border rounded-lg px-6 py-8 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold uppercase">{card.brand}</h3>
                    <span>·</span>
                    <div className="bg-indigo-500 text-white rounded-sm px-2 py-1 text-xs">
                      Default
                    </div>
                  </div>
                  <TrashIcon className="w-4 h-4 stroke-red-500" />
                </div>
                <p className="text-gray-500 flex items-center">
                  Card ending in **** {card.last4}
                </p>
                <p className="text-gray-500">
                  Expires in {card.exp_month}/{card.exp_year}
                </p>
              </div>
            </li>
          ))}
          <li>
            <button className="border rounded-lg px-6 py-8 space-y-2 h-full flex items-center justify-center w-full hover:bg-gray-50">
              <PlusIcon className="w-10 h-10" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}
