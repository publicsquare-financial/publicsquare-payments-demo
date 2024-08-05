type Props = {
  children: React.ReactNode
  name?: string
}

const FormLabel = ({ children, name }: Props) => {
  return (
    <label
      htmlFor={name}
      className="mb-1 block text-xs font-medium leading-3 text-gray-900"
    >
      {children}
    </label>
  )
}

export default FormLabel
