'use client'

import { FormikProps } from 'formik'
import { useEffect, useState } from 'react'

export default function CustomerSelect({
  formik,
}: {
  formik: FormikProps<any>
}) {
  const [customers, setCustomers] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/customers', {
      method: 'GET',
    })
      .then((res) => res.json())
      .then(({ data }) => setCustomers(data))
  }, [])

  return (
    <div className="flex flex-col">
      <label
        htmlFor="customer-select"
        className="block text-sm font-medium text-gray-700"
      >
        Customer to pay
      </label>
      <select
        id="customer-select"
        className="mt-1 block w-full rounded-md border overflow-hidden border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        name="customerId"
        onChange={(e) => {
          formik.setFieldValue(
            'customer',
            customers.find((c) => c.id === e.target.value)
          )
        }}
      >
        <option value="">Select a customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {customer.business_name ??
              `${customer.first_name} ${customer.last_name}`}{' '}
            ({customer.id})
          </option>
        ))}
      </select>
    </div>
  )
}
