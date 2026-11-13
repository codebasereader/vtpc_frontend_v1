// Reads a bilingual field defensively — handles the target `{ en, kn }`
// shape and falls back to a plain string for any backend record that
// hasn't been migrated to the bilingual shape yet (e.g. Leader.name while
// the backend schema change is in flight — see docs/backend-requests/01-leaders.md).
/** Same as getBilingualText, but shows the English text when the chosen language has none yet. */
export function getBilingualTextOrEnglish(value, lang = 'en') {
  return getBilingualText(value, lang) || getBilingualText(value, 'en')
}

export function getBilingualText(value, lang = 'en') {
  if (!value) return ''
  if (typeof value === 'string') return lang === 'en' ? value : ''
  return value[lang] || ''
}
