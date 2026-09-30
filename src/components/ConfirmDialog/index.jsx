import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { useExitTransition } from '../../lib/useExitTransition'

/**
 * Centred confirmation dialog. `tone="danger"` styles the confirm button red.
 * Fades/scales in and out. Closes on Escape or a backdrop click (unless `isBusy`).
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  isBusy = false,
  onConfirm,
  onCancel,
}) {
  const { mounted, visible } = useExitTransition(isOpen, 200)

  // Keep the last text so it doesn't blank out while the dialog fades away.
  const [lastContent, setLastContent] = useState({ title, message })
  if (isOpen && (lastContent.title !== title || lastContent.message !== message)) {
    setLastContent({ title, message })
  }

  useEffect(() => {
    if (!isOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !isBusy) onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, isBusy, onCancel])

  if (!mounted) return null

  const confirmClass =
    tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-primary hover:bg-brand-primary-dark'

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 transition-opacity duration-200 ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={() => !isBusy && onCancel()}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.3)] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-3 scale-95 opacity-0'
        }`}
      >
        <div className="flex items-start gap-4">
          <span
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
              tone === 'danger' ? 'bg-red-50 text-red-600' : 'bg-brand-surface text-brand-primary'
            }`}
          >
            <AlertTriangle size={22} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id="confirm-dialog-title" className="text-lg font-bold text-brand-dark">
              {lastContent.title}
            </h2>
            <p id="confirm-dialog-message" className="mt-1.5 text-sm leading-relaxed text-gray-600">
              {lastContent.message}
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="rounded-lg border border-brand-divider px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${confirmClass}`}
          >
            {isBusy ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
