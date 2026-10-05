import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSelector } from 'react-redux'
import { FolderOpen, FileText, ChevronDown, Eye, Download as DownloadIcon } from 'lucide-react'
import { getDownloadCategories } from '../../../api/downloadCategoriesApi'
import { getDownloads } from '../../../api/downloadsApi'
import { selectLanguage } from '../../../redux/slices/localeSlice'
import { getBilingualText } from '../../../lib/bilingual'
import { safeUrl } from '../../../lib/safeUrl'
import { downloads as t } from '../../../language/downloads'

export default function Downloads() {
  const language = useSelector(selectLanguage)
  const [categories, setCategories] = useState([])
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getDownloadCategories(), getDownloads()])
      .then(([categoriesData, documentsData]) => {
        if (!isMounted) return
        setCategories([...categoriesData].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)))
        setDocuments(documentsData)
      })
      .catch(() => {
        if (isMounted) {
          setCategories([])
          setDocuments([])
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Helmet>
        <title>{t.pageTitle[language]} — VTPC Karnataka</title>
        <meta name="description" content={t.hero.description[language]} />
      </Helmet>

      {/* Hero */}
      <section className="bg-brand-navy-dark px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-3xl font-extrabold text-white md:text-4xl lg:text-[2.75rem]">
            {t.hero.heading[language]}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {t.hero.description[language]}
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-brand-page px-4 py-14 md:px-8 md:py-16">
        <div className="mx-auto max-w-6xl">
          {isLoading && <p className="text-center text-gray-600">{t.loading[language]}</p>}

          {!isLoading && categories.length === 0 && (
            <p className="rounded-2xl border border-dashed border-brand-divider bg-white p-10 text-center text-gray-600">
              {t.noCategories[language]}
            </p>
          )}

          {!isLoading && categories.length > 0 && (
            <div className="flex flex-col gap-8">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  documents={documents.filter((doc) => doc.category === category.id)}
                  language={language}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function CategoryCard({ category, documents, language }) {
  const topLevel = useMemo(
    () => documents.filter((doc) => !doc.parent).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [documents],
  )
  const childrenOf = useMemo(() => {
    const map = new Map()
    documents
      .filter((doc) => doc.parent)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .forEach((doc) => {
        if (!map.has(doc.parent)) map.set(doc.parent, [])
        map.get(doc.parent).push(doc)
      })
    return map
  }, [documents])

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-divider bg-white shadow-[0_8px_24px_rgba(15,40,80,0.06)]">
      <div className="flex items-center gap-3 border-b border-brand-divider bg-brand-surface/50 px-6 py-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white">
          <FolderOpen size={18} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-bold text-brand-navy-dark md:text-xl">{getBilingualText(category.name, language)}</h2>
      </div>

      {topLevel.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-gray-500">{t.empty[language]}</p>
      ) : (
        <div className="divide-y divide-brand-divider">
          {topLevel.map((doc) => (
            <DocumentRow key={doc.id} doc={doc} children={childrenOf.get(doc.id) || []} language={language} />
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentRow({ doc, children, language }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasChildren = children.length > 0

  return (
    <div>
      <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => hasChildren && setIsExpanded((prev) => !prev)}
          className={`flex min-w-0 flex-1 items-center gap-3 text-left ${hasChildren ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-page text-brand-navy">
            <FileText size={16} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold text-brand-dark">
              {getBilingualText(doc.title, language)}
            </span>
            {hasChildren && (
              <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-brand-primary">
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                />
                {children.length} {t.subDocuments[language]}
              </span>
            )}
          </span>
        </button>

        {doc.fileUrl && <DocumentActions fileUrl={doc.fileUrl} language={language} />}
      </div>

      {hasChildren && isExpanded && (
        <div className="animate-fade-slide-up flex flex-col divide-y divide-brand-divider bg-brand-page/40 pl-6">
          {children.map((child) => (
            <div key={child.id} className="flex flex-col gap-3 py-3 pr-6 pl-9 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0 truncate text-sm font-medium text-brand-dark">
                {getBilingualText(child.title, language)}
              </span>
              {child.fileUrl && <DocumentActions fileUrl={child.fileUrl} language={language} compact />}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DocumentActions({ fileUrl: rawFileUrl, language, compact = false }) {
  const fileUrl = safeUrl(rawFileUrl)
  if (!fileUrl) return null
  const size = compact ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'
  return (
    <div className="flex shrink-0 items-center gap-2">
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-lg border border-brand-divider font-semibold text-brand-navy transition-colors hover:bg-brand-page ${size}`}
      >
        <Eye size={compact ? 13 : 14} aria-hidden="true" />
        {t.view[language]}
      </a>
      <a
        href={fileUrl}
        download
        className={`inline-flex items-center gap-1.5 rounded-lg bg-brand-primary font-semibold text-white transition-colors hover:bg-brand-primary-dark ${size}`}
      >
        <DownloadIcon size={compact ? 13 : 14} aria-hidden="true" />
        {t.download[language]}
      </a>
    </div>
  )
}
