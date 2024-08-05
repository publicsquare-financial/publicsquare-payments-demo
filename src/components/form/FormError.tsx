'use client'
import { ErrorMessage } from 'formik'

type Props = {
  name: string
}

const FormError = ({ name }: Props) => {
  return (
    <ErrorMessage
      name={name}
      component="div"
      className="pt-2 text-xs text-red-500"
    />
  )
}

export default FormError
