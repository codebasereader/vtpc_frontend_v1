import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Play, X } from 'lucide-react'
import { selectLanguage } from '../../redux/slices/localeSlice'
import { geographicalIndications as t } from '../../language/geographicalIndications'

const BG_IMAGE = '/assets/images/gi/Artisanal Stories.png'

export default function ArtisanalStories({ products, isLoading }) {
  const language = useSelector(selectLanguage)
  const stories = products.filter((product) => product.video)
  const [activeStory, setActiveStory] = useState(null)

  return (
    <section
      className="relative overflow-hidden bg-brand-navy-dark bg-cover bg-center px-4 py-16 md:px-8 md:py-20"
      style={{ backgroundImage: `url(${encodeURI(BG_IMAGE)})` }}
    >
      {/* Light enough that the background photo actually reads, while
          keeping the white copy legible. */}
      <div className="absolute inset-0 bg-brand-navy-dark/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy-dark/80 via-transparent to-brand-navy-dark/30" />

      <div className="relative mx-auto max-w-6xl">
        <h2 className="text-2xl font-bold text-white md:text-3xl lg:text-[2rem]">
          {t.artisanalStories.heading[language]}
        </h2>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85">
          {t.artisanalStories.description[language]}
        </p>

        {isLoading && <p className="mt-10 text-center text-white/80">{t.treasures.loading[language]}</p>}

        {!isLoading && stories.length === 0 && (
          <p className="mt-10 rounded-2xl border border-dashed border-white/25 p-8 text-center text-white/75">
            {t.artisanalStories.empty[language]}
          </p>
        )}

        {!isLoading && stories.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} language={language} onOpen={() => setActiveStory(story)} />
            ))}
          </div>
        )}
      </div>

      {activeStory && <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />}
    </section>
  )
}

function StoryCard({ story, language, onOpen }) {
  // Real product photo as the thumbnail (no live video preview in the
  // grid — playing/decoding several videos at once reliably froze the tab
  // in testing). The video itself only loads once opened in the modal.
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/5 text-left shadow-[0_16px_36px_rgba(0,0,0,0.35)] ring-1 ring-white/10 backdrop-blur-sm transition-all hover:-translate-y-1 hover:ring-white/30"
    >
      <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-black">
        {story.image ? (
          <img
            src={story.image}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            aria-hidden="true"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-navy to-brand-navy-dark" />
        )}
        <div className="absolute inset-0 bg-black/25 transition-colors group-hover:bg-black/35" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-transform group-hover:scale-110 group-hover:bg-brand-primary">
            <Play size={22} className="ml-0.5 fill-current" aria-hidden="true" />
          </span>
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-white">{story.name?.[language] || story.name?.en}</h3>
        <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-white/75">
          {story.summary?.[language] || story.summary?.en}
        </p>
      </div>
    </button>
  )
}

function StoryModal({ story, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X size={22} aria-hidden="true" />
      </button>

      <video
        src={story.video}
        controls
        controlsList="nodownload"
        autoPlay
        playsInline
        className="h-full max-h-[90vh] w-full max-w-md rounded-2xl object-contain"
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}
