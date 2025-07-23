'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function Page() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/cards')
      .then((res) => res.json())
      .then((data) => setCards(data.data));
  }, []);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Customer Wallet
        </h1>
        <ul role="list" className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cards.map((card) => (
            <li key={card.id}>
              <div className="space-y-2 rounded-lg border px-6 py-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold uppercase">{card.brand}</h3>
                    <span>·</span>
                    <div className="rounded-sm bg-indigo-500 px-2 py-1 text-xs text-white">
                      Default
                    </div>
                  </div>
                  <TrashIcon className="h-4 w-4 stroke-red-500" />
                </div>
                <p className="flex items-center text-gray-500">Card ending in **** {card.last4}</p>
                <p className="text-gray-500">
                  Expires in {card.exp_month}/{card.exp_year}
                </p>
              </div>
            </li>
          ))}
          <li>
            <button className="flex h-full w-full items-center justify-center space-y-2 rounded-lg border px-6 py-8 hover:bg-gray-50">
              <PlusIcon className="h-10 w-10" />
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
