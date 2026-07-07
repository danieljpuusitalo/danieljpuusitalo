# CLAUDE.md — danieljpuusitalo personal site

Personal website of Daniel Uusitalo (Associate @ 4impact capital, The Hague; leads Nordic sourcing; writes publicly). Single-file static site, currently v0.7.0. Hosted on GitHub Pages.

## Architecture — non-negotiables

- **One file.** Everything lives in `index.html`: CSS, HTML, JS, data. No frameworks, no build step, no bundler, no npm. Only external dependency: Google Fonts (Inter Tight + JetBrains Mono). Do not introduce React, Tailwind, or a static-site generator unless Daniel explicitly asks.
- **Companion pages:** `press-kit.html` (standalone press kit with headshot downloads, bios, speaking topics), `404.html` (custom error page). Both share the same design language and favicon.
- **Strictly black & white.** All colors come from the CSS tokens in `:root` (`--bg #0a0a0a`, `--fg #f4f4f1`, `--dim`, `--faint`, `--line`, `--card`). Never add a hue. Photos are forced to B/W via CSS filters — never bypass this.
- **Content is data.** Dynamic sections render from JS arrays in the `DATA` block at the bottom of `index.html`: `WRITING`, `EVENTS`, `BUILDS`, `BUILDS_OVERRIDES`, `PHOTOS`, `EVENT_CHECKLIST`, `DEMO_COMMITS`, plus `CFG`. Editing content means editing an array, not markup. Keep it that way.
- **Everything below the `ENGINE` comment is logic** — safe to refactor, but keep it dependency-free vanilla JS.

## File inventory

| File | Purpose |
|------|---------|
| `index.html` | The entire site: CSS + HTML + JS + data |
| `press-kit.html` | Standalone press kit page (linked from footer) |
| `404.html` | Custom 404 page |
| `og.png` | Open Graph image (1200×630) |
| `photos/` | All images — local, compressed, lazy-loaded |
| `photos/portrait.jpg` | Color headshot |
| `photos/portrait-bw.jpg` | B/W headshot derivative (grayscale + contrast 1.2) |
| `sitemap.xml` | Sitemap for crawlers (referenced by robots.txt) |
| `robots.txt` | Crawler directives + sitemap pointer |
| `.nojekyll` | Prevents GitHub Pages Jekyll processing |

## Design language (retain in every change)

Norrsken-adjacent editorial black/white, deliberately NOT a terminal/OS persona (an earlier draft drifted too close to komulainen.org, do not reintroduce boot sequences, `~$` prompts, `cat`/`grep` labels, or "cold DM" jokes):

- Section labels: mono, bracketed — `[ FILE 01 / BIO ]`, `[ INDEX / RECORD ]`.
- Status glyphs: `■ current` / `□ archive` (not ●/○).
- Photos: auto-B/W + vignette + viewfinder corner brackets + halftone screen that clears on hover; click opens the lightbox (prev/next, arrow keys).
- Camera-flash intro (once per session). Keys: `[1][2][3]` tabs, `[G]` grid, `[F]` re-fire flash, `[D]` negative-film mode.
- Hover state everywhere: invert to white bg / black text. `.spot` cards get a cursor-following spotlight.
- Big type: Inter Tight 800/900 uppercase, tight tracking, `.hollow` = outlined text. Hero name stays modest in size — Daniel vetoed the oversized version. Headlines carry `.reveal.dev` and develop blur→sharp like a photo.
- Grain overlay + ticker (auto-generated from `WRITING` top 6 headlines — never hardcode ticker text) + giant outlined name marquee (`.strip`) above the footer.

## Interaction layer — the "flash field"

- `#field` canvas: full-page halftone dot grid; the cursor is a flash beam (dots brighten/grow within ~240px). Touch devices get an autonomous drifting beam. ~2k dots, one rAF loop, paused on `visibilitychange`.
- Custom cursor: `#cur` (dot) + `#curR` (lagging ring), `mix-blend-mode: difference`; ring snaps square over links, dashed brackets over photos. Enabled only when `pointer: fine` and no reduced-motion (`body.cursor-on`).
- `#wipe`: shutter bars close/open between tab switches (skipped under reduced motion).
- `#exp` + `EXP` readout: scroll progress as exposure. `D187 · W28` day/week counter in topbar.
- NOW rotator: `CFG.NOW` array, shutter-blink swap every ~3.2s.
- Negative mode: `body.negative` swaps the token values (light bg, dark fg) and double-inverts photos into film negatives. Never implement it via `filter: invert()` on body/html — that breaks position:fixed anchoring.
- ALL motion respects `prefers-reduced-motion` (static dot field, no cursor, no wipe, no rotator, no magnetics). Keep that guarantee for anything new.

## Data conventions

- **`archived:true`** on an EVENTS entry: renders the card with `□ ARCHIVE` badge instead of `■` active. Used for interviews and past appearances that should stay visible but marked as historical.
- **`feat:true`** on an EVENTS entry: renders a 2-column featured card (used for WEF).
- **`BUILDS_OVERRIDES`**: keyed by GitHub repo name. Editorial content (num, name, desc, tags) wins over API-generated cards. Special flags:
  - `skipApi:true` with editorial fields (e.g. HuurHel): card uses the override data, repo is skipped in API results.
  - `skipApi:true` without editorial fields (e.g. FloatNote-mac): repo is silently excluded from the builds grid entirely.
  - `url:` on an override: used instead of the GitHub repo URL (for product links on private repos).
- **`EVENT_CHECKLIST`**: upcoming events with `date` (YYYY-MM-DD) for auto-crossout logic — past dates get strikethrough styling.

## Common tasks

- **Add an article**: prepend one object to `WRITING` (`d`, `src`, `type`, `title`, `url`). Filter chips and ticker update automatically. Newest first; index 0 gets the LATEST badge.
- **Add an event**: add to `EVENTS`. `img` accepts a URL or local path (`photos/x.jpg`). `url` links the card to a source. Set `archived:true` for interviews/past appearances. Set `feat:true` for featured 2-col cards.
- **Add a build**: add to `BUILDS` for hardcoded entries, or add to `BUILDS_OVERRIDES` keyed by repo name for repos that should merge with API data.
- **Exclude a repo**: add `'repo-name': {skipApi:true}` to `BUILDS_OVERRIDES`.
- **Swap photos**: drop files into `photos/` (color is fine — CSS converts to B/W). Update paths in `PHOTOS`/`EVENTS`/bio `<figure>`s.
- **Bump version**: the version string lives in 3 places — update all three when releasing: (1) the `<!-- v0.x.x -->` comment near line 5, (2) the hero `.meta` span `V0.x.x`, and (3) the footer `V0.x.x` line. Search for the current version to find them.
- **Commit log**: `CFG.GITHUB_USER = "danieljpuusitalo"`. Pulls public push events from the GitHub API on load; falls back to labelled `DEMO_COMMITS` when there are none. No token, no server.

## Voice rules

Concise, data-anchored, Nordic-humility-with-an-edge. No self-aggrandizing first person ("I lead", "I source" → describe the work, not the ego). No generic VC filler. Playful is fine ("flash tax", "PILGRIMAGE"), cringe is not.

## Analytics

Decision made to add cookieless GoatCounter analytics. Not yet implemented — add to index.html, press-kit.html, and 404.html when ready, and update the footer copy from "no trackers" to "no cookies".

## Facts already verified (don't re-research)

LinkedIn `/in/danieljpuusitalo`, GitHub `danieljpuusitalo`, Medium `@danieljpuusitalo`, X `@Daniel_Uusitalo`. Career: Helen Ventures (energy CVC) before 4impact; Aalto MSc, Brunel BSc; WEF Global Shaper, Climate Reality Leader, Davos50 Delegate WEF 2025; ArcticStartup contributor. Fund II: €68M, closed 11/2024, EIF + Invest-NL, SFDR Art. 9.

## Verification before calling anything done

Open `index.html` in a browser: check all three tabs + subtabs, filter chips, lightbox (click photo, Esc closes), no console errors. Also check ~390px width (mobile layout shifts). Print preview: all three panels present, writing + events visible. Negative mode [D]: verify constellation NYC visible in both modes.

## Deploy

GitHub Pages (repo root, `index.html` is the entry). No config needed. `.nojekyll` present.
