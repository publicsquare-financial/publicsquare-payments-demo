import React, { ComponentProps, HTMLInputTypeAttribute } from 'react';
import FormLabel from './FormLabel';
import FormError from './FormError';
import FormInputField from './FormInputField';

type Props = {
  name: string
  label?: string
  placeholder?: string
  className?: string
  onClick?: () => void
  type?: HTMLInputTypeAttribute | 'currency'
  disabled?: boolean
  step?: string
  autoComplete?: string
  iconBefore?: React.ReactNode
  value?: string
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
  iconBefore,
  value,
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
          iconBefore={iconBefore}
          value={value}
        />
        <FormError name={name} />
      </div>
    </div>
  )
}

export default FormInput;
