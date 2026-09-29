/**
 * Curated GI product categories — matches the live reference site's real
 * taxonomy exactly (vtpc.karnataka.gov.in/geographical-indications),
 * confirmed against the WordPress source's product-list groups. Offered
 * as the admin form's dropdown so new products stay consistent.
 * `category` itself is still a free-text string on GIProduct — no separate
 * backend collection (see docs/backend-requests/07-gi-treasures.md) — so
 * the public GI Treasures tabs (src/sections/GITreasures) always merge this
 * list with whatever category strings actually appear in the live data,
 * rather than assuming every product matches one of these exactly.
 *
 * "Featured Products" is NOT a category here — it's a cross-cutting
 * `featured` boolean flag on the product (the admin list/form toggle), so
 * a product keeps its real category (e.g. Handicrafts) and can also show
 * up under the public Featured tab. See GITreasures's FEATURED_TAB_ID.
 */
export const GI_CATEGORIES = [
  { id: 'agricultural', en: 'Agricultural Products', kn: 'ಕೃಷಿ ಉತ್ಪನ್ನಗಳು' },
  { id: 'handicrafts', en: 'Handicrafts Products', kn: 'ಕರಕುಶಲ ಉತ್ಪನ್ನಗಳು' },
  { id: 'manufactured', en: 'Manufactured Goods', kn: 'ತಯಾರಿಕಾ ಸರಕುಗಳು' },
  { id: 'food', en: 'Food Products', kn: 'ಆಹಾರ ಉತ್ಪನ್ನಗಳು' },
]

export function categoryLabel(categoryEn, language) {
  const match = GI_CATEGORIES.find((category) => category.en === categoryEn)
  return match ? match[language] : categoryEn
}
