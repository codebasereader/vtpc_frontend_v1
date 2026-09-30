/**
 * Accessible on/off switch with a smooth thumb slide and colour fade.
 * `busy` dims it and blocks further clicks while a request is in flight.
 */
export default function ToggleSwitch({ checked, onChange, label, disabled = false, busy = false }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-busy={busy}
      disabled={disabled || busy}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary motion-reduce:transition-none ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } ${busy ? 'cursor-wait opacity-70' : 'cursor-pointer'} disabled:cursor-not-allowed`}
    >
      <span
        aria-hidden="true"
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}
