import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid';
import cx from 'classnames';
import { FieldInputProps } from 'formik';

type Props = {
  options?: {
    name: string;
    value: string;
  }[];
  field: FieldInputProps<string>;
  description?: string;
  loading?: boolean;
  handleChange?: () => void;
};

const Select = ({ options, field, description, loading, handleChange }: Props) => {
  const getDisplayName = (value: string) => {
    return options?.find((option) => option.value === value)?.name;
  };
  const { name } = field;
  return (
    <div className="w-full">
      <Listbox
        name={name}
        value={field.value}
        onChange={(value: string) => {
          field.onChange({ target: { value, name } });
          if (handleChange) {
            handleChange();
          }
        }}
      >
        {description && (
          <Label className="block text-sm font-medium leading-6 text-gray-900">{description}</Label>
        )}
        <ListboxButton
          className="relative flex w-full items-center justify-between rounded-md border border-gray-300 bg-white py-1.5 pl-3 shadow-sm placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
          data-testid={`${name}_dropdown_button`}
        >
          <span className="block truncate">
            {loading && 'Loading...'}
            {!loading && (getDisplayName(field.value) || 'Select an option')}
          </span>
          <span className="pointer-events-none flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        {!loading && (
          <ListboxOptions
            anchor="bottom end"
            className="mt-1 max-h-60 w-[var(--button-width)] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
          >
            {options?.map((option) => (
              <ListboxOption
                key={option.value}
                data-testid={`${name}_${option.value}`}
                className={cx(
                  'active:bg-green cursor-default select-none py-2 pl-3 text-gray-900 hover:bg-gray-50 active:text-white',
                )}
                value={option.value}
              >
                {({ selected, active }) => (
                  <div className="flex w-full cursor-pointer flex-row justify-between">
                    <span
                      className={cx(selected ? 'font-semibold' : 'font-normal', 'block truncate')}
                    >
                      {option.name}
                    </span>

                    {selected ? (
                      <span
                        className={cx(
                          active ? 'text-black' : 'text-green',
                          'flex items-center pr-4',
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </div>
                )}
              </ListboxOption>
            ))}
          </ListboxOptions>
        )}
      </Listbox>
    </div>
  );
};

export default Select;
