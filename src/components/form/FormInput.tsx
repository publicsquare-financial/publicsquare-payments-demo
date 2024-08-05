import React, { ComponentProps, HTMLInputTypeAttribute } from 'react'
import FormLabel from './FormLabel'
import FormError from './FormError'
import FormInputField from './FormInputField'

type Props = {
  name: string
  label?: string
  placeholder?: string
  className?: string
  onClick?: () => void
  type?: HTMLInputTypeAttribute
  disabled?: boolean
  step?: string
  autoComplete?: string
} & ComponentProps<'div'>

const FormInput = ({
  name,
  label,
  placeholder,
  className,
  type,
  disabled,
  step,
  autoComplete,
  ...props
}: Props) => {
  return (
    <div className={className} {...props}>
      {label && <FormLabel name={name}>{label}</FormLabel>}
      <div>
        <FormInputField
          name={name}
          step={step}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          disabled={disabled}
        />
        <FormError name={name} />
      </div>
    </div>
  )
}

export default FormInput
