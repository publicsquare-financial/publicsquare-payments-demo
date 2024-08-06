'use client'
import { Field } from 'formik'
import { ComponentProps } from 'react'

type Props = {
  name: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  placeholder?: string
  onClick?: () => void
  disabled?: boolean
  step?: string
  autoComplete?: string
} & ComponentProps<'input'>

const FormInputField = (props: Props) => {
  return (
    <Field
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
      {...props}
    />
  )
}

export default FormInputField
