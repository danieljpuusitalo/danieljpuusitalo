# Changelog

## v0.8.5 — 2026-08-19 "events grid + fund facts"

Events + builds + work polish. Event checklist: added "Nordic Tech Week 2026, Stockholm" (10–11 Sep 2026), placed chronologically between TechBBQ (Aug) and The Drop (Sep). Events grid: fixed uneven card heights — a two-line headline (e.g. "MACHN FESTIVAL 2026", "CLIMATE REALITY LEADERSHIP SUMMIT 2024") used to expand its box downward while single-line neighbours left empty space; now `.ev-grid` uses `align-items:stretch`, `.ev`/`.ev-body` are flex columns, `.ev h3` reserves `min-height:2.3em` (2 lines), and `.ev .role` pins to the bottom via `margin-top:auto` — every card in a row is equal height with the role tag bottom-aligned. Re-sorted EVENTS to strict reverse-chronological (most recent first) — fixes PitchXL 2025 (Jun) now sitting above Platform6 Stream Connect 2025 (Mar). Added optional per-event `pos` (object-position) support in the render; NODUS Talks `50% 78%` and Climate Reality Summit `50% 80%` crop lower in their thumbnails (same size, more of the bottom shown). Builds: removed em-dashes from descriptions (Team Intelligence / DD-Dev / OCS-Engine now use colons). Work/fund facts: PORTFOLIO 25+ → 23+ companies; removed the "NORDICS · €20M+ earmarked" row; added a "FUNDS · Fund I, Fund II" line under AUM. Browser-verified.

## v0.8.4 — 2026-08-14 "SEO sweep"

Entity/crawlability pass. Added `robots` meta `index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1` to index, gallery and press-kit — enables large image previews and full snippets in Google results. Completed the social-card set: Twitter title/description/image/image:alt/site, plus og:image:alt, og:site_name, og:locale and profile:first_name/last_name. JSON-LD Person strengthened: jobTitle now ["Venture Capitalist","Investor"], added hasOccupation (Occupation, Europe) and mainEntityOfPage → the WebPage node. Hero portrait alt enriched ("Daniel Uusitalo, European venture capitalist"). Sitemap lastmod refreshed to 2026-08-14 across all URLs.

## v0.8.3 — 2026-08-14

Content + polish batch. Mobile: hid the constellation's horizontal scrollbar (`scrollbar-width:none` + `::-webkit-scrollbar`), keeping drag-scroll and the "[ DRAG → ]" hint. Work/Affiliations: ArcticStartup → "Various Outlets" (+"across outlets"); Climate Reality → "Trained by Al Gore in Rome, member of the network."; WEF → "Former Global Shapers, Finnish Curator, Treasurer and sponsored attendee of the WEF Annual Summit 2025." Education: added MIT between Aalto and Brunel (type "Professional Program", subject "Digital Transformation", "Scholarship programme via Santander and MIT Professional Education"). Work/Themes: removed the bullet (`live`) from "Digital sovereignty" and "Physical AI". Builds: DD-Dev description genericized + shortened (dropped 4impact / internals) to "Document transfer and validation infrastructure for due diligence…"; OCS-Engine gains "used by health studios across NL". Browser-verified.

## v0.8.2 — 2026-08-14

De-duplicated the contact block. The bio panel had a "01 / CONTACT SHEET" email block (NO FORMS / email / socials) sitting above the "01 / GALLERY" photo strip, duplicating the footer contact. Removed the bio-panel one; the footer keeps the contact and adopts that block's format — heading now reads "[ CONTACT SHEET ]" with "NO FORMS. NO CALENDLY. JUST MAIL." on its own line (was the single-line "CONTACT / no forms, no calendly, just mail"). Bio panel now flows BIO → CONVICTION → GALLERY. Browser-verified.

## v0.8.1 — 2026-08-14

Browser-verified fixes to the v0.8.0 layout pass. Contact sheet: added `min-width:0` to `.frame` — `flex:0 0 200px` alone was overridden by the default `min-width:auto` (each image's intrinsic width floored the frame wider), so frames still rendered 246–311px and clipped on mobile; now uniform 200px (158px mobile). Bio grid: reverted the centered `justify-content:center` (which indented the text ~75px off the title's left edge and pulled the photos ~75px in from the right) back to an edge-aligned `1fr minmax(0,500px)` — text now flush-left with the title, portrait flush to the right edge, symmetric, mid-gap down from ~172px to ~92px. Verified in-browser (indent 0, photo-to-edge 0, frames uniform).

## v0.8.0 — 2026-08-14 "builds & polish"

Builds: renamed "4impact Data Room" → "DD-Dev" (description unchanged); added OCS-Engine (PRJ/06, "Full-stack social media automation for SMEs" — kept high-level, no client detail), This Website → PRJ/07. Performance: canvas dot-field draw loop optimized — precomputed per-dot twinkle phase, squared-distance gate (skip sqrt for the ~90% of dots outside the cursor radius), and `globalAlpha` + single `fillStyle` instead of a per-dot `rgba()` string (was ~180k string allocations/sec); identical visual, much lighter per frame. Layout: contact-sheet frames given a fixed width (200px desktop / 158px mobile) so thumbnails are uniform on desktop and no longer clip to the left edge on mobile. Bio grid recomposed — capped both columns and centered the pair (was `1.15fr .85fr` with a ~170px dead gutter between text and photos) so text sits beside the photos with balanced editorial margins.

## v0.7.9 — 2026-08-14

Restructured homepage JSON-LD into an `@graph` (WebPage → ImageObject → Person) for a stronger representative-image signal: the portrait is now a full `ImageObject` (1024×1052, contentUrl, caption) referenced by both `Person.image` and the WebPage's `primaryImageOfPage`. Improves eligibility for a Google result thumbnail. No visible-page change. (Title/OG already read "European Venture Capitalist" since v0.7.7 — confirmed no "Finnish Venture Capitalist" remains; factual Finland/nationality references kept.)

## v0.7.8 — 2026-08-13

Image sitemap expanded to help photos re-index under the new domain after the migration: gallery images completed from 5 → 7 (added both Davos 2025 photos), plus homepage portrait + Techarena photo; all lastmod refreshed to 2026-08-13. Gallery page identity text aligned person-first ("European venture capitalist"; dropped "4impact capital" from the meta/OG description and the Techarena alt).

## v0.7.7 — 2026-08-13

Homepage repositioned toward "European venture capitalist" and person-first framing. Title/OG title → "Daniel Uusitalo — European Venture Capitalist"; meta/OG/schema descriptions rewritten person-first (startups, AI, resilience, climate tech). Hero and bio copy generalized off the employer; "Day job" fact → "Venture capital". The WORK panel's 4impact fund-specs card is kept intact (it adds value); `worksFor: 4impact` retained as a factual schema field. No "Associate" anywhere — role reads "Investor" only.

## v0.7.6 — 2026-08-13

Press kit re-centered on Daniel as an independent investor rather than his employer. Short bio replaced with the canonical third-person bio ("European venture capitalist and environmental activist…"); full bio rewritten to lead with the person and mention 4impact capital for specificity (dropped fund mechanics — AUM/SFDR/LP/portfolio-name detail). Meta + OG descriptions repositioned to match.

## v0.7.5 — 2026-08-13

Enriched the JSON-LD Person schema for stronger entity signals: added `description` (canonical bio sentence), `memberOf` (WEF Global Shapers Community, The Climate Reality Project) and `homeLocation` (The Hague). All facts already present on-site, now machine-legible for search/knowledge-graph.

## v0.7.4 — 2026-08-13

Added Threads (threads.net/@danieljpuusitalo) to the JSON-LD sameAs array, matching the verified account set on the Gravatar profile.

## v0.7.3 — 2026-08-13

Entity/SEO: added the Gravatar profile (danieljpuusitalo.link) to the JSON-LD sameAs array, cross-linking the personal site with the Gravatar identity page that feeds Google's person entity. Pairs with off-site levers (Wikidata P856 official website → danieluusitalo.com; Gravatar website field → danieluusitalo.com).

## v0.7.2 — 2026-08-13 "custom domain"

Connected custom domain danieluusitalo.com (GoDaddy DNS → GitHub Pages, HTTPS enforced). Added CNAME file. Repointed all absolute site metadata from the old github.io/danieljpuusitalo/ URL to the apex domain: canonical + og:url + og:image across index.html, press-kit.html and gallery.html; JSON-LD url + image; robots.txt sitemap pointer; and every loc/image:loc in sitemap.xml. GitHub repo/profile links and api.github.com calls left untouched.

## v0.7.1 — 2026-08-13

Content update. Two new writing entries: SeedCue guest post "Someone else decides what your stack costs next year" (Aug 2026) and The Startup Club op-ed "Why the NO had nothing to do with your product" (Aug 2026), both dated 2026.08. New build card: 4impact Data Room (PRJ/02, IN DEVELOPMENT) — the checklist-driven virtual data room for material due diligence; remaining build cards renumbered to PRJ/03–06 in both BUILDS and BUILDS_OVERRIDES.

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
