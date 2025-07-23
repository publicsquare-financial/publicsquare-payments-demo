'use client';

import { Field } from 'formik';
import { ComponentProps, HTMLInputTypeAttribute } from 'react';

type Props = {
  name: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  placeholder?: string;
  onClick?: () => void;
  disabled?: boolean;
  step?: string;
  autoComplete?: string;
  iconBefore?: React.ReactNode;
  type?: HTMLInputTypeAttribute | 'currency';
} & Omit<ComponentProps<'input'>, 'type'>;

const FormInputField = ({ iconBefore, type, ...props }: Props) => {
  return (
    <Field {...props}>
      {({ field }: any) => (
        <div className="flex w-full flex-row items-center rounded-md border border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm">
          {iconBefore && <div className="ml-4">{iconBefore}</div>}
          <input
            {...field}
            className="w-full border-none bg-transparent py-1.5 focus:outline-none focus:ring-0"
            type={type === 'currency' ? 'text' : type}
            onBlur={(e) => {
              if (type === 'currency') {
                const target = e.target as HTMLInputElement;
                if (!target.value || target.value.endsWith('.')) return;
                target.value = parseFloat(target.value.replace(',', ''))
                  .toFixed(2)
                  .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
              }
            }}
          />
        </div>
      )}
    </Field>
  );
};

export default FormInputField;
