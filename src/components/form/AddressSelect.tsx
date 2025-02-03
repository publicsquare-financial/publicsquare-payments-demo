'use client'

import { FormikProps } from 'formik'
import { useState } from 'react'

export default function AddressSelect({
  formik,
}: {
  formik: FormikProps<any>
}) {
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      address_line_1: '123 Main St',
      address_line_2: undefined,
      city: 'New York',
      state: 'NY',
      postal_code: '10001',
      country: 'US',
    },
  ])

  return (
    <div className="flex flex-col">
      <label
        htmlFor="address-select"
        className="block text-sm font-medium text-gray-700"
      >
        Billing address
      </label>
      <select
        id="address-select"
        className="mt-1 block w-full rounded-md border overflow-hidden border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        required
        name="addressId"
        onChange={(e) => {
          formik.setFieldValue(
            'address',
            addresses.find((c) => c.id === e.target.value)
          )
        }}
      >
        <option value="">Select an address</option>
        {addresses.map((address) => (
          <option key={address.id} value={address.id}>
            {address.address_line_1}
            {address.address_line_2 ? `, ${address.address_line_2}` : ''}
            {address.city ? `, ${address.city}` : ''}
            {address.state ? `, ${address.state}` : ''}
            {address.postal_code ? `, ${address.postal_code}` : ''}
          </option>
        ))}
      </select>
    </div>
  )
}
