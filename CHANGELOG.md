# Changelog

## v0.6.0 — 2026-07-07 "content that compounds"

Press kit section in the BIO panel: 50-word and 100-word bios (copy-paste ready, voice-rules compliant), downloadable B/W headshot link, four named speaking topics with data points each. JSON-LD enriched with `alumniOf` (Aalto University, Brunel University London), `knowsAbout` array, and `jobTitle` aligned to "Investor" (matching on-page usage). Footer date confirmed current; version bumped across all three locations.

## v0.5.0 — 2026-07-07 "the flash field"

Full interaction layer, same palette and content. Canvas halftone dot-field across the whole page — the cursor acts as a flash beam (autonomous drift on touch devices). Custom viewfinder cursor (dot + lagging ring, difference-blend, snaps square over links, dashed brackets over photos). Shutter-wipe transition between tabs. Headlines develop like photographs (blur→sharp). NOW-rotator in the hero (`CFG.NOW`). Spotlight hover on cards (`.spot`). Photos carry a halftone screen that clears on hover. Contact-sheet frames sit askew and drag-scroll. Lightbox gains prev/next + arrow keys + counter. Giant outlined name marquee above the footer. Scroll exposure meter (top bar + `EXP` readout) and day/week counter in the topbar. `[D]` toggles negative-film mode (tokens invert, photos become real negatives). Section number watermarks. All effects respect `prefers-reduced-motion`; pointer effects gate on `pointer: fine`.

## v0.4.0 — 2026-07-06

Lightbox on every photo (click, Esc closes). Writing wire gains source-filter chips (auto-generated from data). 35mm contact-sheet strip on bio with sprocket holes, hover zoom, `PHOTOS` array. `[F]` re-fires the camera flash. Viewfinder favicon, JSON-LD person schema, theme-color, aria-selected on all tabs. Repo-ready: CLAUDE.md added for Claude Code.

## v0.3.0 — 2026-07-06

De-komulainen'd: boot sequence → camera-flash intro; bash labels → bracketed editorial labels (`[ FILE 01 / BIO ]`); terminal prompt → EOF line; ●/○ → ■/□; footer jokes rewritten; viewfinder corners on photos.

## v0.2.0 — 2026-07-06

Projects split into BUILDS / WRITING / EVENTS subtabs. Writing wire seeded with 12 verified pieces (Impact Loop, ArcticStartup, Medium, Der Brutkasten, GeekRoom). Events cards (Davos/WEF, Brutkasten, Slush'D Tirana, Slush) with Gravatar photo hotlinks. Deal-funnel card removed. Hero shrunk + toned down. Ticker now runs real headlines. Real links, career history, languages, HEL→NYC→VIE→LON route.

## v0.1.0 — 2026-07-06

First MVP: black/white editorial + terminal accents, three tabs, demo commit feed, grain, ticker, photo placeholders.
