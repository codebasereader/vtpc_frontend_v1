const VARIANT_CLASSES = {
  primary: 'bg-brand-primary text-white hover:bg-brand-primary-dark',
  secondary: 'bg-white text-brand-primary border border-brand-primary hover:bg-brand-surface',
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
