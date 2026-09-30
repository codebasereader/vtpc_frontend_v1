import { useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Phone } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { common } from '../../language/common'
import ContactModal from '../ContactModal'

export default function FloatingContactButton() {
  const language = useSelector(selectLanguage)
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef(null)

  function handleClose() {
    setIsOpen(false)
    // Hand focus back to the button that opened the dialog.
    buttonRef.current?.focus()
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full bg-brand-navy px-4 py-3 text-base font-medium text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-brand-navy-dark hover:shadow-xl sm:right-6 sm:bottom-6"
      >
        <Phone size={16} />
        {common.contactButton[language]}
      </button>
      <ContactModal isOpen={isOpen} onClose={handleClose} />
    </>
  )
}
