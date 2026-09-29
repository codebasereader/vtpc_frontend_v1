# Live site data audit — Focus Sectors, Warehouse Facilities, Market Intelligence

Fetched `https://vtpc.karnataka.gov.in/exporter-corner/` directly (via
`curl -sk` — the site's SSL cert is expired, so `-k` is required; this
also means Playwright/WebFetch refuse it outright) and parsed the
rendered HTML with BeautifulSoup to extract exactly what's really on the
live page for these three sections, then seeded/corrected the real
backend accordingly.

## Focus Sectors of Karnataka — real data found, seeded, and a correction

**The 4 sectors already on the backend before this audit were wrong** —
not a match to the live site at all (IT & ITeS, Tourism & Hospitality,
Engineering & Auto Components don't exist as Focus Sectors on the live
site; they were placeholder/example seed data that happened to look
plausible). The live site actually has **8 real sectors**: Pharmaceutical
& Biotech, Electrical Machinery & Equipment, Ready-made garments,
Automobile, Organic Chemicals, Aerospace, Optical & Medical, Food
Products.

Deleted the 4 wrong entries and created the real 8, each with: real
description, real stat boxes (0–4 per sector — 3 sectors genuinely have
none; the live site's own HTML has the stat-boxes markup commented out
for Organic Chemicals, Optical & Medical, and Food Products, so this is
a real content gap on the source site, not a scraping miss), real
4-year export chart (FY2020–FY2023, USD Mn), real top-5 export markets
by country/percentage, and the real sector image (downloaded from the
live site and re-uploaded through the existing multipart upload).

Full extracted dataset: [`data/focus-sectors.json`](./data/focus-sectors.json).

🟡 **Schema gap, worked around for now:** the live site's "Key Insights"
per sector is actually a 4-column table (Manufacturing Output, Employment
Generated, Value Added, Investments — e.g. "30.4 Lakhs (INR)", "52,797"),
not free text. `FocusSector.keyInsights` is currently a single bilingual
text field, so for now it's been seeded as a formatted single-line string
(`"Manufacturing Output: 30.4 Lakhs (INR) | Employment Generated: 52,797 | ..."`).
Suggested proper fix if/when convenient:
```js
keyInsights: {
  manufacturingOutput: { type: String, default: "" },
  employmentGenerated: { type: String, default: "" },
  valueAdded: { type: String, default: "" },
  investments: { type: String, default: "" },
},
```
Not blocking — the current text-field version already displays correctly
on the frontend.

## Warehouse Facilities — confirmed no real data exists anywhere

Checked the live page's actual behavior, not just its HTML: the district
warehouse list (`#district-list-whid`) is populated by a `fetch()` call
in the page's own JavaScript that points at
`https://vtpc.karnataka.gov.in/wp-content/themes/VTPC/404.php` — a
literal 404 endpoint. It fails silently in the live site's own browser
too. There's also a hardcoded JS fallback `markers` array with 4 entries
("Mysore U-1", "Mysore U-2", "Mysore U-3", "T.Narasipura") that is
obvious placeholder/demo data, not real facility data — one entry even
has a geographically impossible longitude (`16.541`, nowhere near
Karnataka) and generic template text ("This is the first unit in
Mysore.").

**Conclusion: there is no real Warehouse Facilities data on the live
site to extract.** This confirms the earlier decision to leave
`Taluk`/`Warehouse` empty for admin entry — nothing was missed.

## Market Intelligence — already correctly seeded

Cross-checked the live page against the dataset already seeded from the
WordPress source export (`docs/backend-requests/05-market-intelligence.md`)
— same 4 fiscal years, same structure, consistent with what's live now.
No changes needed here.
