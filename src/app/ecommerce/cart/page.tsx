'use client';
import Button from '@/components/Button';
import { useCart } from '@/providers/CartProvider';
import { currency } from '@/utils';
import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export default function Cart() {
  const router = useRouter();
  const cart = useCart();

  const total = useMemo(() => {
    const subtotal = cart.items.reduce((accum, cur) => accum + cur.item.price * cur.quantity, 0);
    return {
      subtotal,
      shipping: 5,
      taxes: 0.07 * subtotal,
      total: subtotal + 0.07 * subtotal,
    };
  }, [cart.items]);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Shopping Cart
        </h1>
        <form className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {cart.items.length ? (
                cart.items.map((product, productIdx) => (
                  <li key={product.item.id} className="flex py-6 sm:py-10">
                    <div className="flex-shrink-0">
                      <img
                        alt={product.item.imageAlt}
                        src={product.item.images[0]}
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-48 sm:w-48"
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                      <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                        <div>
                          <div className="flex justify-between">
                            <h3 className="text-sm">
                              <a
                                href={`/ecommerce/products/${product.item.slug}`}
                                className="font-medium text-gray-700 hover:text-gray-800"
                              >
                                {product.item.name}
                              </a>
                            </h3>
                          </div>
                          <p className="mt-1 text-sm font-medium text-gray-900">
                            {currency(product.item.price)}
                          </p>
                        </div>

                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <label htmlFor={`quantity-${productIdx}`} className="sr-only">
                            Quantity, {product.item.name}
                          </label>
                          <select
                            value={product.quantity}
                            id={`quantity-${productIdx}`}
                            name={`quantity-${productIdx}`}
                            className="max-w-full rounded-md border border-gray-300 py-1.5 text-left text-base font-medium leading-5 text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary sm:text-sm"
                          >
                            <option value={1}>1</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                            <option value={5}>5</option>
                            <option value={6}>6</option>
                            <option value={7}>7</option>
                            <option value={8}>8</option>
                          </select>

                          <div className="absolute right-0 top-0">
                            <button
                              type="button"
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500"
                              onClick={() =>
                                cart.setItems(
                                  cart.items.filter((cur) => cur.item.id !== product.item.id),
                                )
                              }
                            >
                              <span className="sr-only">Remove</span>
                              <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="flex justify-center py-6 text-gray-500 sm:py-10">
                  <p>No products yet...</p>
                </li>
              )}
            </ul>
          </section>

          {/* Order summary */}
          <section
            aria-labelledby="summary-heading"
            className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8"
          >
            <h2 id="summary-heading" className="text-lg font-medium text-gray-900">
              Order summary
            </h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">{currency(total.subtotal)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex items-center text-sm text-gray-600">
                  <span>Shipping estimate</span>
                  <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Learn more about how shipping is calculated</span>
                    <QuestionMarkCircleIcon aria-hidden="true" className="h-5 w-5" />
                  </a>
                </dt>
                <dd className="text-sm font-medium text-gray-900">{currency(total.shipping)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="flex text-sm text-gray-600">
                  <span>Tax estimate</span>
                  <a href="#" className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Learn more about how tax is calculated</span>
                    <QuestionMarkCircleIcon aria-hidden="true" className="h-5 w-5" />
                  </a>
                </dt>
                <dd className="text-sm font-medium text-gray-900">{currency(total.taxes)}</dd>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">{currency(total.total)}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Button
                onClick={() => router.push('/ecommerce/checkout')}
                disabled={!cart.items.length}
              >
                Checkout
              </Button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
