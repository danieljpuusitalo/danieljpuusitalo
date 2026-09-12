# Changelog

## v0.9.6 — 2026-09-12 "two events back, one city corrected"

Two entries added to `EVENTS`, which goes from 12 visible cards to 14. **Pitch Events at Antler Helsinki** (Nov 2024, Helsinki, investor jury) and the **Global Shapers Annual Summit 2022** (Geneva, delegate) — the latter dated from the summit itself, 2–4 September 2022. Neither carries a source link: the Antler sessions have no public page, and the Global Shapers card points at the Forum's standing meeting page rather than a 2022 archive.

**The Climate Reality entry was in the wrong city and the wrong month.** It read `SEP 2024 / HELSINKI, FI` while the CV row three panels up said "Trained by Al Gore in Rome" — a contradiction sitting in one file. The photo settles it: Italian slides, Al Gore on the screen. Corrected to `JUN 2024 / ROME, IT`, the 56th Climate Reality Leadership training, 28–30 June 2024. Note that `EVENTS` still has no date sort — unlike `WRITING`, it renders in raw array order, so both new entries were placed by hand.

`EVENT_CHECKLIST`: The Drop 2026 in Malmö is 15–16 September, not a single day. The `date` field is the event's *last* day, so the crossout now fires on the 17th rather than the 16th.

Both photos join `gallery.html` and the image sitemap, cropped to the 3:2 / 1600px / sub-200KB band the other event thumbnails sit in — the Antler source was 8816px and 9.2MB. The four copies of the gallery's page description were left alone: at ~220 characters they are already past what a search snippet will show, and lengthening the venue list to add two more names makes that worse, not better. The visible intro paragraph does name both.

## v0.9.5 — 2026-09-11 "the archive's schema was never valid"

`writing.html` exists for one reason: crawlers that don't run JavaScript see nothing on the homepage wire, so the archive is the static mirror that carries the articles and their structured data. Its structured data has been unparseable since v0.9.0.

The generator's `<!-- GEN:SCHEMA -->` markers sat *inside* the `<script type="application/ld+json">` tag, so every render put an HTML comment between the opening tag and the opening `{`. That is not valid JSON — `JSON.parse` and Python's `json` both reject it — which means the CollectionPage, the ItemList and all 21 Article nodes, 24 in total, were being discarded by any strict consumer. The markers now sit outside the tag and `build-writing.mjs` emits the `<script>` wrapper itself, which is what makes that placement possible.

Worth naming the reason it survived three releases: `--check` compares `writing.html` against what the generator would produce. Both were wrong in the same way, so it passed every time. A sync check is not a validity check, and `CLAUDE.md` now says so.

Also: `sitemap.xml` `lastmod` for `writing.html` moved to 2026-09-11.

## v0.9.4 — 2026-09-11 "Nordic Tech Week"

New EVENTS entry: **Nordic Tech Week 2026**, Stockholm, SPEAKER — the Mastercard Lighthouse fintech-and-impact panel at Volvo Studio Stockholm, 10 Sep 2026. It leads the grid, which goes from 11 cards to 12, and is named after the parent event rather than the session so it reads like every other card. The same photo opens `gallery.html`, whose intro list and four copies of the page description now name Stockholm's Nordic Tech Week alongside Tirana, Leipzig, Tampere and Davos.

The room photo was downscaled to the 1600px / sub-200KB band the other event thumbnails sit in — the source was 3000px and 4.4MB — and it is exactly 3:2, which is the ratio the gallery grid crops to. The Luma link is stored without its `?tk=` invite token: that token is per-recipient and does not belong in a public href.

## v0.9.3 — 2026-09-08 "contradiction sweep"

A full audit of every page, plus the public repo metadata, for claims that had gone stale or that contradict each other.

**Hard factual errors.** The Impact Loop "Scouting Nordic energy tech" interview was dated `NOV 2024` in `EVENTS` and `2025.11` in `WRITING` — one item, two years. Verified against the live article (3 Nov 2025); `EVENTS` was wrong and is corrected. The CV said "WEF **Annual Summit** 2025" while the same file's `EVENTS` said "WEF Annual **Meeting** 2025" — the Meeting is the real event. `DEMO_COMMITS`, which renders whenever the GitHub API is rate-limited, advertised "ship v0.5.1" on a v0.9.x site.

**Schema contradicting the page.** JSON-LD asserted present `memberOf` the WEF Global Shapers Community while the visible CV row said "Former" with an `□ archive` glyph, and the press kit said "(alumni)". Moved to `alumniOf`, which is schema-valid for a past organisational affiliation and keeps the entity link. (Care needed: `alumniOf` already existed for Aalto and Brunel — a second key would have silently dropped both.)

**Retired-claim sweep.** "One file / no build step / single file" removed from the source header, the footer, `README.md` and the project card; the card had also drifted to "three companion pages" while the file header listed four. The header claimed Google Fonts was the only dependency, omitting GoatCounter. `README.md` rewritten with a structure table and the generator workflow.

**Public repo metadata.** The site repo's GitHub description still read "One file, no build step" and its homepage pointed at the **old** `danieljpuusitalo.github.io` URL rather than the canonical domain — both fixed. The `nexus` repo description still read "Personal CRM desktop app", contradicting the site's own card; updated to the record layer.

**Labels vs content.** The EVENTS sub-note promised "interviews", but every interview in `EVENTS` is `archived:true` and filtered out of the grid — it now points at the writing archive, where they actually live. The contact-sheet label gains a link to `gallery.html`, mirroring how the writing sub-note links its archive. The "Side quests" card omitted Building, the single most load-bearing one on the page.

**Numbering and print.** Auto-discovered build cards seeded their index from key counts, including `skipApi` stubs that render nothing, so the visible sequence jumped PRJ/07 → PRJ/09; now seeded from the highest rendered number. The empty "COMMUNITY — IN DEVELOPMENT" tab was printing on the one-page CV.

**Companion pages** now share a consistent three-item cross-link nav; `writing.html` was previously orphaned, reachable only from the homepage. Its meta description omitted LinkedIn and GeekRoom, and its intro claimed a "full archive" of interviews after the Ladderworks entry was deliberately removed — now "selected". Press-kit bio word-count labels said 50 and 120 words for bios that are 38 and 110. Gallery geography omitted Germany while listing Leipzig. One image alt dropped the surname.

## v0.9.2 — 2026-09-08 "project copy, corrected and sharpened"

**Team Intelligence — questionnaire restored.** v0.9.1 over-corrected: the founder/team questionnaire (the team-scan lens, `/q/:slug` and `/i/:token`, scored by `packages/scan-scoring`) is real and operational, and removing it understated the platform. The original sentence's actual flaw was implying the questionnaire and the research pipeline feed one blended number — something the codebase explicitly forbids ("the scan lens and profiler lens never merge into one number"). Now framed as **dual-lens**: a scored questionnaire *alongside* the document-and-web evidence pipeline. Both lenses present, neither merged.

**OCS-Engine sharpened.** Reframed from "full-stack social automation" to an autonomous engine, naming the compliance linter, the human veto window, the KPI contract that re-weights the next cycle, and the 554-test suite running unattended. Every claim verified against the repo — still no Meta ads claim, because that integration does not exist, and still no version number, because the project has none.

**"This Website" was out of date.** "One HTML file" stopped being true the moment the companion pages landed; there are now three linked ones (`writing.html`, `press-kit.html`, `gallery.html`) plus a 404. Copy updated to "one hand-written HTML file plus three companion pages", and it now mentions the generated writing archive. The `single file` tag — which contradicted the new sentence — became `hand-written`.

## v0.9.1 — 2026-09-08 "date authority + project accuracy"

**Writing.** Removed the Ladderworks entry — same interview as the Nasdaq piece, weaker domain, so only the stronger surface is listed (the Ladderworks URL still lives on Wikidata P973). **Date is now the sole ordering authority**: `dkey()` normalises `"2026.09"` → `202609` and year-only `"2025"` → `202500` (sorting below every month of that year), and the wire, the ticker and the generated archive all render from `WRITING_SORTED`. Array order is now irrelevant — nothing can appear out of place again regardless of where a new entry is pasted. The generator validates date format and month range, failing loudly on a malformed date, and prints a non-fatal note if the source array itself is out of order. Also corrected the archived Nasdaq event card: dated 2025 when the article is March 2024, and pointed at the bare domain instead of the article.

**Projects.** Team Intelligence rewritten for accuracy — the old line claimed "questionnaires" (which merges two lenses the codebase deliberately keeps separate), "online footprint monitoring" (nothing is continuous; every scan is analyst-triggered) and "automated reference triangulation" (not a feature — the string appears nowhere in the source and it implies reference calls the tool never makes). Now describes what it does: document extraction, web/registry/domain verification, graded scores with confidence intervals. Nexus rewritten from "local-first personal CRM" to the conversation record layer it became after the September pivot, status LIVE → IN DEVELOPMENT, stack tags Electron/SQLite → React/TypeScript/Vite. OCS-Engine IN DEVELOPMENT → IN PRODUCTION with the publishing rail and KPI collector named. Card copy kept within the grid's existing length band.

**Architecture note.** `CLAUDE.md` now records Daniel's framing that "one file, no build step" is a marketing gimmick rather than a hard rule — the real test is maintainability. `This Website` copy adjusted accordingly ("no build step" → "no bundler").

## v0.9.0 — 2026-09-08 "one source of truth for writing"

Closes the drift risk v0.8.9 opened. `writing.html` is now **generated** from the `WRITING` array by `tools/build-writing.mjs`, so adding an article is one edit plus one command instead of two hand-edits that could silently disagree. Zero dependencies, no npm, no watcher — a maintenance script run by hand, not a build step; the site still deploys as plain static files. `--check` mode exits non-zero if the two files have drifted. `type` now drives the authored/about split declaratively (`OPED`/`COLUMN`/`BLOG`/`ARTICLE` → `author`; `INTERVIEW`/`QUOTED`/`FEATURE` → `about` + `Person.subjectOf`), and an unknown type makes the generator fail loudly rather than guess — miscategorising an interview as authored is both a factual and a schema error. Added optional `note` (clarifier under the title) and `lang` (emits `inLanguage`) fields. The Nasdaq and Ladderworks interviews, which existed only in the hand-written archive, are now in `WRITING` and therefore appear in the homepage wire too — 20 pieces to 22. Fixed a pre-existing sort bug: the May 2026 Startup Club interview sat between two January 2025 entries. Both Nasdaq URL forms (literal `:` and `%3A`) resolve; the encoded form is now used. Neither Nasdaq nor Ladderworks is labelled "original" — Ladderworks syndicates to Nasdaq, but the bylined dates run the other way (23 vs 29 Mar 2024), so each simply carries its own date and a cross-reference. Browser-verified, no console errors.

## v0.8.9 — 2026-09-08 "writing archive"

New companion page `writing.html` — a static, crawlable archive of all published writing. Reason: the homepage writing wire renders from a JS array into two nested `display:none` containers, so a crawler that doesn't execute JavaScript sees nothing (verified: a non-JS fetch of the live homepage returns zero article titles). Googlebot renders JS and was fine; the AI crawlers (OpenAI, Anthropic, Perplexity) execute none, so the whole corpus was invisible to them. Same pattern as `gallery.html` — a static mirror, not a build step. 22 pieces as visible HTML rows readable with CSS alone (deliberately no `opacity:0`+JS reveal, which would reproduce the original defect), split into 14 authored op-eds/columns and 8 interviews/commentary — a distinction the `WRITING` array never made. JSON-LD: `CollectionPage` → `ItemList` of thin `Article` nodes with `author` for authored work and `about` + `Person.subjectOf` for pieces about him; no `image`/`articleBody`, and every schema node maps 1:1 to a visible row. Surfaced two pieces missing from the wire entirely — the Nasdaq syndication and its Ladderworks original, labelled as such. Corrected the TechRound GCSE entry: it is a roundup by another author quoting Daniel among ten contributors, not his byline — retyped `FEATURE` → `QUOTED`. Linked from the footer and the writing sub-note; added to `sitemap.xml` and refreshed all `lastmod` dates (stale at 2026-08-14). Browser-verified, no console errors.

## v0.8.8 — 2026-09-08

Added "What the VC process actually looks like" (The Startup Club, 2026.09) to the writing wire — takes the LATEST badge and feeds the ticker automatically.

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
