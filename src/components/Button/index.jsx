const VARIANT_CLASSES = {
  primary: 'bg-blue-700 text-white hover:bg-blue-800',
  secondary: 'bg-white text-blue-700 border border-blue-700 hover:bg-blue-50',
}

export default function Button({ children, variant = 'primary', className = '', ...rest }) {
  return (
    <button
      className={`rounded-md px-4 py-2 font-medium transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
