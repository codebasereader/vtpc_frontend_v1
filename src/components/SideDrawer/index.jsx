import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useExitTransition } from '../../lib/useExitTransition'

/**
 * Generic right-hand drawer (slides in/out). `isOpen` controls visibility;
 * `title`/`subtitle` and children are kept while it slides away so nothing
 * blanks out mid-animation.
 */
export default function SideDrawer({ isOpen, title, subtitle, onClose, children, width = 'max-w-xl' }) {
  const { mounted, visible } = useExitTransition(isOpen, 300)
  const [last, setLast] = useState({ title, subtitle })
  if (isOpen && (last.title !== title || last.subtitle !== subtitle)) setLast({ title, subtitle })

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previous
    }
  }, [isOpen, onClose])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={last.title}
        className={`absolute inset-y-0 right-0 flex h-dvh w-full ${width} flex-col bg-white shadow-[-12px_0_40px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <header className="flex items-center justify-between gap-3 border-b border-brand-divider px-5 py-4">
          <div className="min-w-0">
            {last.subtitle && <p className="text-[11px] font-bold tracking-wide text-gray-500 uppercase">{last.subtitle}</p>}
            <h2 className="truncate text-lg font-bold text-brand-dark">{last.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-full p-2 text-gray-600 hover:bg-brand-page"
          >
            <X size={22} />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </aside>
    </div>
  )
}
