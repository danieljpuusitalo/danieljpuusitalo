# IMPROVEMENT BRIEF — danieljpuusitalo v0.5.0 → v0.7

Prepared 2026-07-07 from a full audit of `index.html` (1,573 lines), the repo, the GitHub API, and live web checks.
Run with Claude Code, **one phase per session**, in order (Phase D — design — slots after Phase 4 and is cherry-pickable). Commit per phase. CLAUDE.md rules apply to every change — nothing here overrides the non-negotiables (one file, strictly B/W, content-as-data, no build step).

**Verdict.** The identity is strong and the interaction layer is genuinely good — the problem is everything around it. The site is not actually deployed (GitHub Pages is off), invisible when shared (no `og:image`), 28MB heavy in photos, has ~10 real bugs including two wrong event years and a broken repo link, and fails WCAG contrast on every `--faint` label. All fixable without touching the design.

---

## Decisions (answered 2026-07-07)

1. **Domain: none bought yet.** Ship on `https://danieljpuusitalo.github.io/danieljpuusitalo/` — all absolute URLs (canonical, `og:url`, `og:image`) use it. When a domain is bought later: `CNAME` file + DNS A records + enforce HTTPS + swap those three absolute URLs. Nothing else changes.
2. **HuurHel: link the card to the live product** — `https://www.huurhel.nl/` (verified live, 200). See Phase 3 item 3.
3. **Analytics: YES, cookieless.** See Phase 1 item 7.
4. **Portrait: DONE** — already copied into the repo as `photos/portrait.png` (1024×1052, 1.74MB RGBA). Phase 2 compresses it and swaps out the Gravatar hotlink at L733.
5. **Contact-sheet captions — still open.** Six frames say `[ caption ]`. Write six real captions (place, year) — nobody else can.

---

## PHASE 1 — Ship & be seen (v0.5.1)

*Nothing else matters while the site is undeployed and shares as a blank card.*

1. **Deploy.** GitHub Pages is OFF (`has_pages:false`, API-verified). Enable: Settings → Pages → deploy from `master` / root. Add empty `.nojekyll`. Verify `https://danieljpuusitalo.github.io/danieljpuusitalo/` renders and the commit feed shows `LIVE / GITHUB`.
2. **Domain: skipped for now** (Decision 1). Base URL for all absolute references in this phase: `https://danieljpuusitalo.github.io/danieljpuusitalo/`.
3. **OG image.** Create `og.png` 1200×630, strictly in-identity: `#0a0a0a` ground, halftone dot texture, viewfinder corner brackets, `DANIEL` solid + `UUSITALO` hollow (Inter Tight 900), mono label line `[ INVESTOR / WRITER / DEN HAAG ]`. Route: write a throwaway `og-template.html`, then `npx playwright screenshot --viewport-size=1200,630`, commit only `og.png`, delete template.
4. **Head block** (after line ~15): `og:image` (absolute URL), `og:image:width/height`, `og:url`, `og:type=profile`, `twitter:card=summary_large_image`, `twitter:creator=@Daniel_Uusitalo`, `<link rel="canonical">`, `meta name="author"`.
5. **Title** (L12): `daniel uusitalo — investor, 4impact capital` (SERP CTR; the h1 carries the brand).
6. **JSON-LD** (L17–23): `"se"` → `"sv"` (ISO 639-1); add `"url"` and `"image"` (og.png or portrait).
7. **Analytics (Decision 3: yes).** GoatCounter — free, cookieless, one script tag. Manual step for Daniel: create the account at goatcounter.com (pick code `danieljpuusitalo`). Claude Code adds the script + updates footer copy at L960: "One file, no trackers" → "One file, no cookies" (stay honest). Verify events register after deploy.
8. **Repo metadata:** description + homepage URL on the GitHub repo (both null; the repo IS the calling card for the commit feed).

**Accept:** site live; LinkedIn Post Inspector and an X card validator both render the image; `curl -sI` on og.png = 200; GoatCounter dashboard shows the first pageview.
**Prompt:** *"Read IMPROVEMENT_BRIEF.md and CLAUDE.md. Execute Phase 1. Domain decision: [X]. Stop after committing; give me the Pages/DNS steps I must click myself."*

---

## PHASE 2 — Cut 28MB to ~2MB (v0.5.2)

Measured: `photos/` = **28.0MB / 12 files**, up to 8192px wide, displayed at ≤ ~630px. `bio-techarena.jpg` (6.9MB, 6494×4329) loads on the **default tab**. Filenames contain spaces and an apostrophe.

1. **One-off script (not committed):** Pillow or sharp — resize longest edge to 1600px, JPEG quality ~78, strip EXIF. Targets: hero/bio photos < 200KB, event cards < 150KB. Keep color originals elsewhere; CSS does the B/W.
2. **Rename to slugs:** `techarena-zero-2026.jpg`, `machn-leipzig-2026.jpg`, `slushd-tirana.jpg`, … Update every reference: `EVENTS` (L997–1024), bio `<figure>` (L737), nothing else references local files.
3. **Replace Gravatar:** portrait is already in the repo as `photos/portrait.png` (1024×1052, 1.74MB RGBA) — flatten to JPEG ~q80 (<200KB), swap into L733. The 8 `PHOTOS` entries (L1055–1064) still hotlink Gravatar: download, compress, localize. Add the six real captions (Decision 5 — still pending from Daniel).
4. Add `width`/`height` attrs (or keep aspect-ratio classes — verify no CLS) and `decoding="async"` to rendered `<img>` templates (L1352, L1409).
5. **Optional, do now or never:** repo is one day old with zero forks — `git filter-repo` to purge the 28MB originals from history before anyone clones. Skip if Pages is already serving and it feels risky.
6. Update CLAUDE.md "Swap photos" section (Gravatar note obsolete).

**Accept:** `du -sh photos/` ≤ 3MB; first-view transfer (bio tab, cold cache) < 900KB in DevTools Network; all lightboxes still open; B/W filter intact.
**Prompt:** *"Execute Phase 2 of IMPROVEMENT_BRIEF.md. Show me the size table before/after. Don't touch design tokens or filters."*

---

## PHASE 3 — Correctness punch list (v0.5.3)

Every item verified against the code; line numbers from current `index.html`.

| # | Bug | Where | Fix |
|---|-----|-------|-----|
| 1 | **Wrong event years.** Techarena Zero was **28 May 2026** (Kista Science Tower; photo file `260528_…` agrees; web-verified). Machn Festival was **3–4 Jun 2026** (web-verified). Site says MAY/JUN 2025. | EVENTS L998–1001; EVENT_CHECKLIST L1028–1029; bio figure caption + alt L736–737 | Correct to 2026 everywhere; while in there, web-verify PitchXL, Slush'd Tirana, Startup Club years + The Drop (15 Sep) and TechBBQ (26 Aug) 2026 dates against official sites |
| 2 | **Event-card photo click fires twice**: opens lightbox AND follows the card link in a new tab (no `preventDefault`; card is an `<a>`, doc-level handler at L1451–1457 opens lightbox on `.photo`). | L1342–1359, L1451–1457 | In the doc click handler: if the matched `.photo` sits inside an `<a>`, `preventDefault()` + `stopPropagation()` — photo = lightbox, card body = link |
| 3 | **HuurHel card links to a 404** (repo not public; API-verified). | BUILDS L1042 | Decision 2: point the card at the live product instead — `gh:"https://www.huurhel.nl/"` (verified live). The `gh` field just makes the card a link, so it works as-is; note in a comment that it's a product URL, and exclude it from any Phase 5 repo-API matching |
| 4 | **Keyboard shortcuts ignore modifiers**: Ctrl+F fires the flash alongside browser find; Cmd/Ctrl+D toggles negative while bookmarking. | L1271–1283 | Bail if `e.metaKey||e.ctrlKey||e.altKey` |
| 5 | **Constellation hover is a no-op**: labels default `fill="var(--dim)"`; main CSS hover sets `--dim` again (L324) and loses to/conflicts with SVG-internal rule setting `--fg` (L600–603). Two rules, one dead. | L324, L600–603 | Keep one rule: hover → `--fg`; delete the other |
| 6 | **"CET" hardcoded** in the topbar clock — it's CEST from Mar–Oct. | L1190 | Derive via `Intl.DateTimeFormat(...{timeZoneName:'short'})` or drop the suffix |
| 7 | **Two events show "DROP PHOTO"** placeholder publicly (Nasdaq Ladderworks, Abbey Road). | L1012–1013, L1020–1021 | Design the no-photo state: typographic card (oversized mono event initials on `--card`, corner brackets), not a dashed to-do note |
| 8 | **`aria-selected` on subtab buttons without `role="tab"`** — invalid ARIA. | L903–905 | Add `role="tab"` (tablist exists at L902) or switch to `aria-pressed` |
| 9 | **README is stale**: says "commit -m v0.4.0", instructs `git init` on an existing repo. | README.md | Rewrite Run/Deploy sections to reflect reality |
| 10 | Version string lives in 3 places (L5 comment, L685 hero meta, L962 footer) + CHANGELOG — drifts easily. | — | Note in CLAUDE.md: bump all three per release |

**Accept:** CLAUDE.md browser QA (3 tabs, 3 subtabs, chips, lightbox, Esc, ~390px) + zero console errors + every card link resolves 200.
**Prompt:** *"Execute Phase 3 of IMPROVEMENT_BRIEF.md — the 10-item punch list. Web-verify all event dates in item 1 before editing. One commit per logical group."*

---

## PHASE 4 — Accessibility, without diluting the art (v0.5.4)

Measured contrast on `#0a0a0a`: `--dim` #7d7d78 = **4.79:1** (passes AA); `--faint` #3a3a37 = **1.73:1** (fails hard; 1.48:1 in negative mode). `--faint` is used as *text* at 9–11px: `.fcap` L318, `.sub-note` L400, `.pnum` L412, `.wdate` L460, `.wtype` L465, `.tnum` L363, tick labels, tip keys.

1. **Split the token's roles.** Keep `--faint` for borders/strokes/watermarks (that's texture, exempt). Route all *text* uses to `--dim` (already passes AA) — hierarchy survives via size/tracking/weight, which these labels already have. Do the same audit in negative mode.
2. **Lightbox** (L556–569, L1434–1457): `aria-modal="true"`, move focus to close button on open, trap Tab, restore focus on close.
3. **Keyboard path to the lightbox:** `.frame .ph` and bio `.photo` get `tabindex="0"` + Enter/Space to open. Event-card photos stay mouse-only (they're inside `<a>`; keyboard users get the link) — acceptable, note it in CLAUDE.md.
4. **Tabs ARIA pattern** (L695–699): `id` per tab, `aria-controls` → panel ids, `aria-labelledby` on panels (L706/762/897), roving tabindex + ←/→ arrow keys.
5. **Filter chips** (L1324–1339): `aria-pressed`.
6. **Ticker** (L700): `aria-hidden="true"` — decorative, duplicated content; the real list lives in WRITING.
7. **Skip link** to `<main>`, visually hidden until focused, styled in-identity (`[ SKIP TO CONTENT ]`).
8. Contact-sheet `<img alt="">` (L1409) — captions exist; pipe `p.cap` into alt.

**Accept:** Lighthouse a11y ≥ 95; keyboard-only walkthrough: tabs → chips → a photo → lightbox → Esc → focus lands back where it was.
**Prompt:** *"Execute Phase 4 of IMPROVEMENT_BRIEF.md. Contrast token split first; show me every changed selector. Then ARIA. No visual regressions — hierarchy via weight/size, not new grays."*

---

## PHASE D — Design refinement pass (v0.5.5, run after Phase 4)

*No redesign — the identity is right. These are the details a design director would flag. Cherry-pick, but D1–D4 are near-free wins. Hierarchy stays weight/size-based: no new grays, no hues.*

| # | Refinement | Where | Detail |
|---|-----------|-------|--------|
| D1 | **Lead with the name, not the map.** The constellation (320px tall) is the first thing on the page; identity comes ~400px later. | L586–683 vs L684–693 | Move the constellation below the h1/sub block (or shrink viewBox height to ~240 with a stronger edge fade). Reorder, don't resize the name — the modest-h1 veto stands |
| D2 | **Invisible links.** Portfolio links (Exnaton, GreenShift, Carbon Equity, OurMind, InfoTiles) render as plain dim text — zero affordance. Record rows already do it right with inline `border-bottom`. | L799 vs L824 | One convention: `.tdesc a, .now-card p a, .bio-copy a { border-bottom:1px solid var(--faint) }`, hover → `--fg`; then strip the ad-hoc inline styles (L770, L824, L830…) into that rule |
| D3 | **Hairline seams.** `.facts` and `.proj-grid` cells carry `border-right/bottom` inside a bordered container → doubled 2px lines at right/bottom edges. | L292–298, L403–416 | Switch both to the gap technique: container `background:var(--line); gap:1px`, cells `background:var(--bg)` — uniform 1px hairlines everywhere |
| D4 | **`&nbsp;` column alignment** in fund-facts breaks the moment a label changes. | L777–781 | `.fund-facts div { display:grid; grid-template-columns:96px 1fr }` — delete the hard spaces |
| D5 | **Front-page treatment for the flagship event.** The grid treats WEF Davos and a podcast identically — listings with no lead story. | EVENTS + L477–487 | Add `feat:true` flag → `@media(min-width:700px){ .ev.feat{ grid-column:span 2 } }` + larger h3; set it on WEF 2025. Editorial hierarchy, 4 lines of engine |
| D6 | **Dead CSS → signal.** `.chip.live` (● prefix) exists at L375 but no chip uses it — while digital sovereignty and physical AI are the two *live theses*. | L375, L810–817 | Add `class="chip live"` to those two chips. Instant "what's hot now" layer on the themes row |
| D7 | **Touch devices see every photo permanently dimmed** — the halftone/vignette screen clears on hover, which doesn't exist on mobile. | L276–283 | `@media(hover:none){ .photo::after{ opacity:.35 } }` — keep the texture, lose the murk |
| D8 | **No `:focus-visible` styles anywhere** — keyboard focus falls back to default rings that fight the aesthetic. | global | Design it in-identity: `:focus-visible{ outline:2px solid var(--fg); outline-offset:3px }` (pairs with Phase 4 keyboard work) |
| D9 | **Lightbox pops with no entrance** while everything else has shutter language. | L491–497 | 150ms opacity + scale .98→1 on `#lb figure` via a `.open` transition; skip under reduced motion |
| D10 | **Typographic micro-set:** `text-wrap:balance` on `.bigline`/h2 (kills orphans), `text-wrap:pretty` on `.bio-copy p`, `font-variant-numeric:tabular-nums` on clock/EXP/daymeta so digits don't jitter each second, site-wide `scrollbar-color:var(--faint) var(--bg)` (Windows default scrollbar currently glares against #0a0a0a) | L237, L261, topbar, `html` | All zero-risk, progressive |
| D11 | **Constellation on mobile scrolls with no cue** — 640px min-width inside overflow-x with no hint anything is off-screen. | L336–339 | Edge-fade mask on the container + a tiny `[ DRAG → ]` mono cue under 700px |
| D12 | **Systematize the one-offs:** inline divider `<div style="border-top…">` ×2 and the checklist's inline-styled rows. | L860, L877, L1371–1376 | `.rule` utility class; checklist rows get classes — keeps the DATA-block philosophy clean |

**Accept:** side-by-side screenshots per item (before/after) at 1280px and 390px; negative mode `[D]` checked after D2/D3/D6; no new color values introduced — verify `:root` token count unchanged.
**Prompt:** *"Execute Phase D of IMPROVEMENT_BRIEF.md, items D1–D12. Screenshot before/after per item at 1280px and 390px. Design language rules from CLAUDE.md are hard constraints — hierarchy via weight and size only."*

---

## PHASE 5 — Live data (v0.6.0) — roadmap items 1–2

1. **BUILDS from GitHub.** One client-side call to `/users/danieljpuusitalo/repos?sort=pushed`. Merge, don't replace: a curated `OVERRIDES` map keyed by repo name keeps your editorial `desc`/`num`/`tags`; API contributes stars, language, pushed-at recency, and **new repos appear automatically**. Non-public entries (Team DD Platform) stay hardcoded. Static `BUILDS` array remains the offline/rate-limit fallback (same pattern as the commit feed, L1516–1531).
2. **`writing.json` via GitHub Action** (fits the no-build philosophy: page still works standalone). Weekly cron + manual dispatch; zero-dependency Node script fetches `https://medium.com/feed/@danieljpuusitalo`, regex-parses title/link/date, merges with non-Medium entries (which stay hand-curated in the array), commits `writing.json` only on diff. Client: `fetch('writing.json')` → fallback to inline `WRITING`. Ticker and chips already derive from data — untouched.
3. **SEO tradeoff to accept, not solve:** writing/events/builds render via JS only. Google executes JS; many AI crawlers don't. If that starts to matter, revisit pre-rendering — do NOT add an SSG now.

**Accept:** kill network in DevTools → site fully renders from inline arrays; restore network → live repos + writing.json win; new Medium post appears within a week with zero edits.
**Prompt:** *"Execute Phase 5 of IMPROVEMENT_BRIEF.md. Fallback behavior is sacred: the file must render standalone from inline data with network blocked. Show me the Action YAML before committing."*

---

## PHASE 6 — Content that compounds (v0.6.x)

Aimed at the actual goals: speaking slots, press, inbound.

1. **Press kit section** — `[ FILE 04 / PRESS ]` or a footer block: 50- and 100-word bios (voice rules apply: describe the work, not the ego), downloadable B/W headshot (the one asset organizers always chase), 3–4 named speaking topics with one data point each (Nordic humility/ambition; impact as underpriced mainstream; energy tech; EU competitiveness). Highest-leverage content addition on this list.
2. **RECORD years** (roadmap 4): replace NOW/PREV with real year ranges (L822–858). You supply the dates; approximate is fine, absent is not.
3. **JSON-LD enrichment:** `alumniOf` (Aalto, Brunel), `knowsAbout`, `jobTitle` consistency ("Investor" on-page vs "Associate" in schema — pick one).
4. **Writing wire, optional:** a one-line `take:` field per piece rendered under the title — turns a link list into a point of view. Only if it can be kept current.
5. **Footer honesty pass:** if analytics got added in Phase 1–5, reword "no trackers"; auto-derive `DEPLOYED` date from `document.lastModified` or keep manual per CLAUDE.md.

**Prompt:** *"Execute Phase 6 items [pick]. Draft the two bios and speaking topics for my approval before touching HTML — voice rules from CLAUDE.md."*

---

## PHASE 7 — Polish backlog (whenever)

- **Print stylesheet:** the page prints as a clean one-page B/W CV (hide canvas/grain/cursor/ticker/strip, light ground, stack panels). On-brand party trick, ~40 lines of CSS.
- **404.html** in-identity (`[ FRAME NOT FOUND ]`, link home) for Pages.
- **LICENSE** (MIT for code, note content reserved) + `robots.txt`.
- Canvas micro-opt: cap DPR at 1 on touch devices; measure first, likely unnecessary.
- Self-host the two fonts (drops the last third-party call; ~160KB, cache-forever). Philosophical call: "one file + photos + fonts" vs Google Fonts dependency.
- Guard tab-switch shortcuts (1/2/3) while lightbox is open.
- Skip `history.replaceState('#bio')` on initial load (URL gets a hash before any user action).

---

## Global acceptance bar (every phase)

1. CLAUDE.md verification ritual: 3 tabs, 3 subtabs, filter chips, lightbox + Esc + arrows, ~390px layout, **zero console errors**.
2. `prefers-reduced-motion` walkthrough unbroken (static field, no cursor/wipe/rotator).
3. Negative mode `[D]` visually sane after any token/color change.
4. Post-deploy: PageSpeed Insights mobile — Perf ≥ 90, A11y ≥ 95, SEO ≥ 95, LCP < 2.5s.
5. CHANGELOG.md entry + version bump (3 locations) per release; CLAUDE.md roadmap pruned as items ship.

## Do not

Add frameworks, build steps, colors, or terminal-persona elements (CLAUDE.md bans them); lighten the grain; bypass the B/W photo filter; hardcode ticker text; implement negative mode via `filter:invert()` on body; break the works-offline-from-one-file guarantee.
