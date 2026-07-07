# CLAUDE.md — danieljpuusitalo personal site

Personal website of Daniel Uusitalo (Associate @ 4impact capital, The Hague; leads Nordic sourcing; writes publicly). Single-file static site, currently v0.5.0.

## Architecture — non-negotiables

- **One file.** Everything lives in `index.html`: CSS, HTML, JS, data. No frameworks, no build step, no bundler, no npm. Only external dependency: Google Fonts (Inter Tight + JetBrains Mono). Do not introduce React, Tailwind, or a static-site generator unless Daniel explicitly asks.
- **Strictly black & white.** All colors come from the CSS tokens in `:root` (`--bg #0a0a0a`, `--fg #f4f4f1`, `--dim`, `--faint`, `--line`, `--card`). Never add a hue. Photos are forced to B/W via CSS filters — never bypass this.
- **Content is data.** Dynamic sections render from five JS arrays in the `DATA` block at the bottom of `index.html`: `WRITING`, `EVENTS`, `BUILDS`, `PHOTOS`, `DEMO_COMMITS`, plus `CFG`. Editing content means editing an array, not markup. Keep it that way.
- **Everything below the `ENGINE` comment is logic** — safe to refactor, but keep it dependency-free vanilla JS.

## Design language (retain in every change)

Norrsken-adjacent editorial black/white, deliberately NOT a terminal/OS persona (an earlier draft drifted too close to komulainen.org, do not reintroduce boot sequences, `~$` prompts, `cat`/`grep` labels, or "cold DM" jokes):

- Section labels: mono, bracketed — `[ FILE 01 / BIO ]`, `[ INDEX / RECORD ]`.
- Status glyphs: `■ current` / `□ archive` (not ●/○).
- Photos: auto-B/W + vignette + viewfinder corner brackets + halftone screen that clears on hover; click opens the lightbox (prev/next, arrow keys).
- Camera-flash intro (once per session). Keys: `[1][2][3]` tabs, `[G]` grid, `[F]` re-fire flash, `[D]` negative-film mode.
- Hover state everywhere: invert to white bg / black text. `.spot` cards get a cursor-following spotlight.
- Big type: Inter Tight 800/900 uppercase, tight tracking, `.hollow` = outlined text. Hero name stays modest in size — Daniel vetoed the oversized version. Headlines carry `.reveal.dev` and develop blur→sharp like a photo.
- Grain overlay + ticker (auto-generated from `WRITING` top 6 headlines — never hardcode ticker text) + giant outlined name marquee (`.strip`) above the footer.

## Interaction layer (v0.5) — the "flash field"

- `#field` canvas: full-page halftone dot grid; the cursor is a flash beam (dots brighten/grow within ~240px). Touch devices get an autonomous drifting beam. ~2k dots, one rAF loop, paused on `visibilitychange`.
- Custom cursor: `#cur` (dot) + `#curR` (lagging ring), `mix-blend-mode: difference`; ring snaps square over links, dashed brackets over photos. Enabled only when `pointer: fine` and no reduced-motion (`body.cursor-on`).
- `#wipe`: shutter bars close/open between tab switches (skipped under reduced motion).
- `#exp` + `EXP` readout: scroll progress as exposure. `D187 · W28` day/week counter in topbar.
- NOW rotator: `CFG.NOW` array, shutter-blink swap every ~3.2s.
- Negative mode: `body.negative` swaps the token values (light bg, dark fg) and double-inverts photos into film negatives. Never implement it via `filter: invert()` on body/html — that breaks position:fixed anchoring.
- ALL motion respects `prefers-reduced-motion` (static dot field, no cursor, no wipe, no rotator, no magnetics). Keep that guarantee for anything new.

## Voice rules

Concise, data-anchored, Nordic-humility-with-an-edge. No self-aggrandizing first person ("I lead", "I source" → describe the work, not the ego). No generic VC filler. Playful is fine ("flash tax", "PILGRIMAGE"), cringe is not.

## Common tasks

- **Add an article**: prepend one object to `WRITING` (`d`, `src`, `type`, `title`, `url`). Filter chips and ticker update automatically. Newest first; index 0 gets the LATEST badge.
- **Add an event**: add to `EVENTS`. `img` accepts a URL or local path (`photos/x.jpg`). `tmpl:true` renders the dashed placeholder card.
- **Add a build**: add to `BUILDS`. `gh` URL makes the card a link.
- **Swap photos**: currently hotlinking Daniel's public Gravatar gallery. Long-term: create a `photos/` folder, drop originals (color is fine — CSS converts), update paths in `PHOTOS`/`EVENTS`/bio `<figure>`s.
- **Commit log**: `CFG.GITHUB_USER = "danieljpuusitalo"`. Pulls public push events from the GitHub API on load; falls back to labelled `DEMO_COMMITS` when there are none. No token, no server.

## Facts already verified (don't re-research)

LinkedIn `/in/danieljpuusitalo`, GitHub `danieljpuusitalo`, Medium `@danieljpuusitalo`, X `@Daniel_Uusitalo`. Career: Helen Ventures (energy CVC) before 4impact; Aalto MSc, Brunel BSc; WEF Global Shaper, Climate Reality Leader, Davos50 Delegate WEF 2025; ArcticStartup contributor. Fund II: €68M, closed 11/2024, EIF + Invest-NL, SFDR Art. 9. Approximate dates flagged: Impact Loop interview (~2025.11), Brutkasten (~2025.01), GeekRoom (2025).

## Verification before calling anything done

Open `index.html` in a browser: check all three tabs + three subtabs, filter chips, lightbox (click photo, Esc closes), no console errors. Also check ~390px width (mobile layout shifts for `.wrow`, `.topbar`, `.tabs`).

## Deploy

Netlify Drop or GitHub Pages (repo root, `index.html` is the entry). No config needed.

## Roadmap (Daniel's stated intent)

1. Live GitHub wiring beyond the commit log — public repos auto-populating `BUILDS`.
2. Writing wire from RSS/APIs (Medium RSS exists; ArcticStartup/Impact Loop likely scraping or manual) — a small fetch script or GitHub Action generating a `writing.json` would fit the no-build philosophy better than client-side scraping.
3. Real photo set replacing Gravatar hotlinks.
4. OG image, custom domain, real career-history years.
