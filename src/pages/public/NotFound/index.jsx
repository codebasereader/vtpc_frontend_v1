import { useSelector } from 'react-redux'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { common } from '../../../language/common'

export default function NotFound() {
  const language = useSelector(selectLanguage)

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
      <h1 className="text-2xl font-semibold">{common.notFound.title[language]}</h1>
      <p className="text-gray-600">{common.notFound.body[language]}</p>
    </div>
  )
}
