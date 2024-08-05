import { Field, FieldInputProps } from 'formik'
import Select from './Select'

type Props = {
  name: string
  options: { value: string; name: string }[]
}

const FormSelect = (props: Props) => {
  const { name, options } = props

  return (
    <Field name={name}>
      {({ field }: { field: FieldInputProps<string> }) => (
        <Select options={options} field={field} />
      )}
    </Field>
  )
}

export default FormSelect
