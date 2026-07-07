# Changelog

## v0.7.0 — 2026-07-07 "the audit"

Bug fixes, drift corrections, and design polish from a full-site audit. Machn Festival link fixed (was pointing at wrong organization). NYC constellation stop remapped into the shrunken viewBox. Startup Club date corrected to 2026. Print CSS now shows all subtab panels and reveal elements. Live builds sort order fixed (override group sorted by PRJ number). FloatNote-mac excluded from auto-discovered build cards. Sitemap.xml created (robots.txt was advertising a 404). Press kit restructured: heading de-duplicated, B/W headshot derivative added alongside color, canonical + OG tags, bio word count corrected. Event card grid no longer stretches short cards to match featured-card height. Subtab count contrast fixed. og:title aligned with page title. 404 page gains favicon. Skip-link target gains tabindex. Orphaned contact-01.jpg removed. Stale microcopy updated to present tense. CHANGELOG rebuilt from git history. CLAUDE.md rewritten to match current architecture. Version bumped across all three locations.

## v0.6.2 — 2026-07-07

Print stylesheet (clean A4 CV), custom 404 page, LICENSE, robots.txt with sitemap directive.

## v0.6.1 — 2026-07-07

Press kit as standalone page (press-kit.html) linked from footer. JSON-LD enriched with alumniOf, knowsAbout, jobTitle.

## v0.6.0 — 2026-07-07 "live builds"

Live GitHub API integration: public repos auto-populate BUILDS with stars, language tags, and push recency. BUILDS_OVERRIDES map lets editorial content win over API-generated cards. Static BUILDS array used as fallback when offline or rate-limited. Commit feed already live since v0.5.0.

## v0.5.5 — 2026-07-07

Design refinements D1–D12: viewBox tightened, vignette mask on constellation, feat-card spanning, contact-sheet photo swap, bio photo updates, community tab placeholder.

## v0.5.4 — 2026-07-07

Accessibility pass: all `--faint` text upgraded to `--dim` (4.79:1 contrast), ARIA roles and states on tab rows, roving tabindex + arrow-key navigation, focus trap in lightbox with restore, skip-link, focus-visible outlines.

## v0.5.3 — 2026-07-07

Correctness punch list: 10 bugs fixed including event-card double-fire, CEST timezone derivation, lightbox focus management, checklist auto-crossout logic, stale URLs.

## v0.5.2 — 2026-07-07

Photos compressed 29MB → 2.3MB. All images localized to `photos/` directory (no more Gravatar hotlinks). Lazy loading + async decoding on all images.

## v0.5.1 — 2026-07-07 "ship & be seen"

OG image (1200x630, in-identity), full meta tags (canonical, og:*, twitter:card), deploy prep. Constellation route map added to hero.

## v0.5.0 — 2026-07-07 "the flash field"

Full interaction layer, same palette and content. Canvas halftone dot-field across the whole page — the cursor acts as a flash beam (autonomous drift on touch devices). Custom viewfinder cursor (dot + lagging ring, difference-blend, snaps square over links, dashed brackets over photos). Shutter-wipe transition between tabs. Headlines develop like photographs (blur to sharp). NOW-rotator in the hero. Spotlight hover on cards. Photos carry a halftone screen that clears on hover. Contact-sheet frames sit askew and drag-scroll. Lightbox gains prev/next + arrow keys + counter. Giant outlined name marquee above the footer. Scroll exposure meter and day/week counter in the topbar. [D] toggles negative-film mode. Section number watermarks. All effects respect prefers-reduced-motion.

## v0.4.0 — 2026-07-06

Lightbox on every photo. Writing wire gains source-filter chips. 35mm contact-sheet strip on bio. [F] re-fires the camera flash. Viewfinder favicon, JSON-LD person schema, theme-color, aria-selected on tabs. CLAUDE.md added.

## v0.3.0 — 2026-07-06

De-komulainen'd: boot sequence replaced with camera-flash intro; bash labels replaced with bracketed editorial labels; terminal prompt replaced with EOF line; status glyphs changed to squares; footer rewritten; viewfinder corners on photos.

## v0.2.0 — 2026-07-06

Projects split into BUILDS / WRITING / EVENTS subtabs. Writing wire seeded with 12 verified pieces. Events cards with photos. Deal-funnel card removed. Hero shrunk. Ticker runs real headlines. Real links, career history, languages, constellation route.

## v0.1.0 — 2026-07-06

First MVP: black/white editorial + terminal accents, three tabs, demo commit feed, grain, ticker, photo placeholders.
