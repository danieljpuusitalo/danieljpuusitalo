# CLAUDE.md — danieljpuusitalo personal site

Personal website of Daniel Uusitalo — venture capitalist at 4impact capital, The Hague (Investor; leads Nordic sourcing; writes publicly). Hand-written static site, currently v0.12.0. Hosted on GitHub Pages, served at the custom domain **https://danieluusitalo.com/** (the `danieljpuusitalo.github.io/danieljpuusitalo/` URL now 301-redirects here).

## Positioning — non-negotiables

Identity-facing copy leads **person-first**, not employer-first.

- **Role word is "Investor" or "venture capitalist". Never "Associate"** — anywhere, including this file, the README, and commit messages.
- Name form is **"Daniel Uusitalo"**. "Daniel J.P. Uusitalo" is an alias only (Wikidata), never a display name.
- 4impact references are otherwise kept light and factual: the WORK-panel fund-specs card, `worksFor` in schema, the CV role entry, contact/footer. Helen Ventures is a **past** role — never present-tense.

  **Amended 2026-09-18 (Daniel approved the new bio explicitly).** v0.4.x/v0.5.0 deliberately stripped "4impact capital" *out* of the descriptions to read person-first. The employer is now back, but only in the predicate of the canonical bio. Person-first is unchanged as a rule: Daniel is still the grammatical subject and the page is still about him, not the fund. The reason for the reversal is entity resolution, not positioning. `worksFor` is structured data and structured data is not what gets excerpted, so with no employer in any readable prose there was no name-to-organisation triple on the site at all. Do not extend this into employer-led copy anywhere else.
- **Canonical bio — reuse VERBATIM, do not paraphrase.** It must stay byte-identical across `index.html` (meta/OG/Twitter/JSON-LD `Person.description` **and the visible lead paragraph of the BIO panel**), `press-kit.html`, `writing.html`, Gravatar, and every third-party profile:

  > Daniel Uusitalo is a venture capitalist at 4impact capital, where he invests in early-stage European software companies across the Nordics, DACH and Benelux. Born in Finland and based in The Hague, he is a Climate Reality Leader and writes about start-ups, artificial intelligence and climate tech.

  Note the exact forms: "start-ups" hyphenated, "writes about" (not "writing about"), and the opening semantic triple **"Daniel Uusitalo is a venture capitalist at 4impact capital"** — subject, predicate, organisation, in the first clause. Keep all three.

  **Why byte-identity matters, corrected 2026-09-18.** The old rule here said "Google fuses person descriptions from multiple sources". That is **not** how it works and the claim traces to a single unsourced sentence. Google **selects one source** and excerpts it, which it confirms in its own docs by telling you to "contact the source of the information" rather than offering an edit field. Consistency still decides the outcome, but the mechanism is *which source wins*, not *how the blend comes out*. Right rule, wrong reason: do not relax it.

  **Third person is a requirement, not a style preference.** A knowledge-panel description is always third person, so first-person prose cannot be selected as a source at all. The BIO panel's lead paragraph was first person until 2026-09-18, which made the site's most authoritative page unusable as a source. Paragraphs after the lead stay in his voice; the lead does not.

## Architecture — non-negotiables

- **One file — a preference, not a commandment.** Everything lives in `index.html`: CSS, HTML, JS, data. No frameworks, no bundler, no npm. Only external dependency: Google Fonts (Inter Tight + JetBrains Mono).

  **Daniel's own framing (2026-09-08): "the one file no build step thing is more of a marketing gimmick as part of this website — it is not a hard rule if it makes sense to improve the website in ways the principle does not align with, as long as the website continues to be easy to maintain and add to."** So the real test is **maintainability, not purity**. Don't refuse a genuine improvement to protect the slogan; do refuse anything that makes adding an article, event or project harder than editing an array. React, Tailwind and a full SSG remain off the table unless Daniel asks — those fail the maintainability test, not the slogan test.
- **`tools/` holds hand-run maintenance scripts, not a build pipeline.** Four generators, all zero-dependency, all sharing `tools/lib.mjs`, all supporting `--check`:

  | Script | Reads | Writes |
  |---|---|---|
  | `build-writing.mjs` | `WRITING` | `writing.html` |
  | `build-gallery.mjs` | `EVENTS` | `gallery.html` + `sitemap.xml` |
  | `build-projects.mjs` | `BUILDS` | the static mirror inside `index.html`'s `#builds-grid` |
  | `build-contributions.mjs` | github.com/users/:u/contributions (network) | the contribution card inside `index.html`'s `#gh-card` |

  The first three are pure: same input, same output, so `--check` demands byte equality. `build-contributions.mjs` reads a live third-party page that changes every time Daniel commits, so byte equality would fail daily and train you to ignore it. Its `--check` is offline and validates structure and age instead (missing markers, malformed grid, snapshot older than 90 days). Only the re-snapshot path touches the network.

  The site still deploys as plain static files with nothing to compile. Don't add a `package.json` or a watcher — the value is that a human runs one command and can read the diff. **Run all four `--check`s before calling any content change done.**

  ⚠️ **GitHub disables a scheduled workflow after 60 days without repository activity, and the job's own bot commits do not count** — only a human push does. GitHub emails before it happens. If the card ever goes quiet for weeks, check the Actions tab for a disabled schedule before assuming the script broke; the fix is the "Enable workflow" button, and any real commit resets the clock. For this repo it is mostly theoretical, since 60 untouched days would make the whole site stale anyway.

  **The one automated exception, added 2026-09-19 at Daniel's request:** `.github/workflows/contributions.yml` runs `build-contributions.mjs` on a schedule and commits the result. It earns the exception because it is the only generator whose input is not in the repo — writing, gallery and projects are pure functions of arrays a human edits, so a human should run them and read the diff, and that rule is unchanged for all three. The heatmap's input is Daniel's own activity, which moves without anyone touching a file, so leaving it to memory guarantees a stale card. **Don't generalise this into a build pipeline.** If you are about to automate a generator whose input lives in `index.html`, the answer is no.
- **Client-rendered panels need static mirrors.** Every dynamic section renders inside two nested `display:none` containers, so a crawler that doesn't execute JS sees nothing. Googlebot renders JS; the OpenAI, Anthropic and Perplexity crawlers do not. Four surfaces are therefore mirrored: writing → `writing.html`, events/photos → `gallery.html`, projects → generated HTML inside `#builds-grid` that the renderer overwrites on load, and the contribution heatmap → generated HTML inside `#gh-card`, which since v0.12.0 has no client render at all. The commit-log feedbox is the one that is still JS-only, by design: it is a live ticker, not content. **If you add another client-rendered content section, it needs a mirror too** — otherwise it is invisible to everything except Google.
- **Companion pages (four):** `writing.html` (generated writing archive), `press-kit.html` (headshot downloads, bios, speaking topics), `gallery.html` (photo archive), `404.html` (custom error page). All four share the same design language and favicon.
- **Strictly black & white.** All colors come from the CSS tokens in `:root` (`--bg #0a0a0a`, `--fg #f4f4f1`, `--dim`, `--faint`, `--line`, `--card`). Never add a hue. Photos are forced to B/W via CSS filters — never bypass this.
- **Content is data.** Dynamic sections render from JS arrays in the `DATA` block at the bottom of `index.html`: `WRITING`, `EVENTS`, `BUILDS`, `BUILDS_OVERRIDES`, `EVENT_CHECKLIST`, `DEMO_COMMITS`, plus `CFG`. Editing content means editing an array, not markup. Keep it that way.

  **There is no `PHOTOS` array any more** (removed 2026-09-12). Every event photograph is declared once, in that event's `pics[]`, and three derived lists fall out of it — don't reintroduce a second hand-maintained photo list:

  | Derived | What it is |
  |---|---|
  | `EVENTS_SORTED` | `EVENTS` newest first, by `dkey(k)` |
  | `ARCHIVE` | every pic of every non-archived event, flattened, newest first. `gallery.html` is its static mirror. |
  | `SHEET` | `ARCHIVE.filter(p => p.sheet)` — the 35mm contact strip on the bio tab |
- **Everything below the `ENGINE` comment is logic** — safe to refactor, but keep it dependency-free vanilla JS.

## File inventory

| File | Purpose |
|------|---------|
| `index.html` | The entire site: CSS + HTML + JS + data. The projects cards inside `#builds-grid` are **generated** — do not hand-edit inside the `<!-- GEN:BUILDS -->` markers |
| `writing.html` | Crawlable writing archive — **generated** from `WRITING`, do not hand-edit inside the `<!-- GEN:… -->` markers |
| `tools/lib.mjs` | Shared helpers for all four generators: `readArray`, `dkey`, `esc`, `isoDate`, `jpegSize`, `splice`, `die`. No deps. |
| `tools/build-writing.mjs` | Regenerates `writing.html` from `WRITING`. Run by hand, not a build step. Zero deps. |
| `tools/build-gallery.mjs` | Regenerates `gallery.html` + `sitemap.xml`'s image block from `EVENTS`. Validates hard: missing fields, malformed `k`, duplicate slugs, stub alts, missing files, **orphan photos**. |
| `tools/build-projects.mjs` | Regenerates the static projects mirror inside `index.html` from `BUILDS`. |
| `tools/build-contributions.mjs` | Re-snapshots the GitHub contribution heatmap into `index.html`'s `#gh-card`. The only generator that hits the network. Validates GitHub's headline total against its own per-day sum, then reconciles each day against the commits API and takes the higher of the two. Refuses to write a number it cannot reconcile. |
| `press-kit.html` | Standalone press kit page (linked from footer) |
| `404.html` | Custom 404 page |
| `og.png` | Open Graph image (1200×630) |
| `photos/` | All images — local, compressed, lazy-loaded |
| `photos/portrait.jpg` | Color headshot |
| `photos/portrait-bw.jpg` | B/W headshot derivative (grayscale + contrast 1.2) |
| `gallery.html` | Photo archive — **generated** from `EVENTS`. The most complete surface on the site: every frame, including ones no event card shows. |
| `sitemap.xml` | Sitemap for crawlers (referenced by robots.txt) |
| `robots.txt` | Crawler directives + sitemap pointer |
| `.nojekyll` | Prevents GitHub Pages Jekyll processing |
| `CNAME` | Custom-domain pointer for GitHub Pages (`danieluusitalo.com`) |
| `.gitignore` | Backstop only. The real protection is that private docs live outside this repo — see below. |

## Private working docs — NOT in this repo

**This repo is PUBLIC.** Personal working notes — anything not about the website itself — live in **`../danieljpuusitalo-private/`** (i.e. `~/danieljpuusitalo-private/`), outside the repo entirely. That folder has its own README indexing them.

**Why outside rather than ignored (moved 2026-09-08):** they previously sat *inside* this repo protected only by an **untracked** `.gitignore` — so one `git add -A`, or a fresh clone where that file did not exist, would have published them. Committing that `.gitignore` was not a fix either: it had to *name* each file, and the names are themselves the disclosure. Do not move them back, and do not list them in `.gitignore`.

**The same rule applies to commit messages, changelog entries and this file.** A commit message is exactly as public as a tracked file, and it cannot be edited later without rewriting history. Describe *what changed in the site*; never describe the contents of the private folder.

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

### The EVENTS shape

Every event carries the fields three surfaces need. Required: `k`, `d`, `city`, `name`, `role`, `slug`, and a non-empty `pics`. `build-gallery.mjs` fails loudly on any of them, so a malformed entry can never reach the site.

| Field | Meaning |
|---|---|
| `k` | sort key, `"YYYY.MM"` or `"YYYY"` if the month is unknown. `dkey()` turns it into a number; year-only sorts below every dated month of that year. |
| `d` | the human date shown on the card (`"SEP 2026"`, `"2022–2023"`) |
| `slug` | the event's anchor in `gallery.html`, and therefore a **public URL**. URL-safe, unique, and not to be changed casually. |
| `pics[]` | every photograph of this event, best first: `src`, `alt`, optional `cap` / `note` / `pos` / `sheet` |
| `pos` | `object-position` for the crop, event-level; a pic-level `pos` overrides it. Portraits need one — the archive grid is 3:2. |

Two rules the generator enforces that are worth knowing before you hit them:

- **`alt` describes what is VISIBLE in the frame**, in at least five words. An alt is a factual claim, not a keyword slot — only name him when he is actually identifiable.
- **No orphans in `photos/`.** Every JPEG must be referenced by a `pics[]` or listed in the script's `NON_EVENT` allowlist. An unreferenced photo in a public repo is either a forgotten entry or dead weight.

The archive anchor for a pic is `slug` for the first one and `slug-N` for the rest. The lightbox caption links to it, so a viewer can jump from any photo on the homepage to its archive entry.

### Other conventions

- **`archived:true`** on an EVENTS entry: renders the card with `□ ARCHIVE` badge instead of `■` active. Used for interviews and past appearances that should stay visible but marked as historical.
- **`feat:true`** on an EVENTS entry: renders a 2-column featured card (used for WEF).
- **`BUILDS_OVERRIDES`**: keyed by GitHub repo name. Editorial content (num, name, desc, tags) wins over API-generated cards. Special flags:
  - `skipApi:true` with editorial fields (e.g. HuurHel): card uses the override data, repo is skipped in API results.
  - `skipApi:true` without editorial fields (e.g. FloatNote-mac): repo is silently excluded from the builds grid entirely.
  - `url:` on an override: used instead of the GitHub repo URL (for product links on private repos).
- **`EVENT_CHECKLIST`**: upcoming events with `date` (YYYY-MM-DD) for auto-crossout logic — past dates get strikethrough styling.

## Common tasks

- **Add an article**: ONE edit, then one command.
  1. Prepend one object to `WRITING` in `index.html` (`d`, `src`, `type`, `title`, `url`; optional `note`, `lang`). Newest first; index 0 gets the LATEST badge. Filter chips and ticker update automatically.
  2. Run `node tools/build-writing.mjs` to regenerate `writing.html`.

  `WRITING` is the **single source of truth** for both the homepage wire and the crawlable archive. Never hand-edit `writing.html`'s rows or JSON-LD — the generator overwrites everything between the `<!-- GEN:… -->` markers. Prose outside the markers (intro, headings, styles) is safe to edit by hand.

  **The `GEN:SCHEMA` markers must stay OUTSIDE the `<script type="application/ld+json">` tag, which the generator emits itself.** An HTML comment between the opening tag and the opening `{` makes the block invalid JSON and strict parsers reject the entire graph — v0.9.0 shipped it that way and all 24 nodes were unparseable until v0.9.5. If you ever move a marker, re-run `node -e "JSON.parse(...)"` on the block, not just `--check` (which compares the two files and happily confirms that both are broken in the same way).

  **`type` decides authorship, so get it right** — it selects both the section and the schema claim:
  - `OPED` · `COLUMN` · `BLOG` · `ARTICLE` → "Written by", emits `author: {@id: #person}`
  - `INTERVIEW` · `QUOTED` · `FEATURE` → "Interviews & commentary", emits `about:` + a `Person.subjectOf` reference

  Miscategorising an interview as authored is both a factual error and a schema one. An unknown `type` makes the generator **fail loudly** rather than guess — if you add one, extend `KIND` in the script and make the authored/about call deliberately. (Precedent: TechRound "GCSE Results Day" is a roundup by another author quoting him, not his byline; it was mislabelled `FEATURE` until 2026-09-08.)

  `node tools/build-writing.mjs --check` exits non-zero if the two files have drifted — run it if you're unsure whether someone hand-edited the archive.

  **Why the archive exists:** the homepage wire is client-rendered inside two nested `display:none` containers, so any crawler that doesn't execute JS sees nothing. Verified 2026-09-08 — a non-JS fetch of `/` returned zero article titles. Googlebot renders JS and was fine; the OpenAI, Anthropic and Perplexity crawlers execute none. `writing.html` is the static mirror that fixes that.

  **Keep Article nodes thin** — the generator emits only `url`, `name`, `publisher`, `datePublished`, and one of `author`/`about`. No `image`, no `articleBody`. Fat nodes for content hosted on someone else's domain read as rich-result farming and risk a "structured data does not match page content" manual action. Every schema node maps 1:1 to a visible row; keep it that way.
- **Add an event**: ONE edit, then one command.
  1. Add an object to `EVENTS` with the fields above, and drop its photos into `photos/`. `url` links the card to a source. Set `archived:true` for interviews/past appearances, `feat:true` for featured 2-col cards.
  2. Run `node tools/build-gallery.mjs` to regenerate `gallery.html` + `sitemap.xml`.

  Position in the array does not matter — `k` decides the order everywhere. Never hand-edit `gallery.html`'s figures or its schema.
- **Add a build**: add to `BUILDS` for hardcoded entries, or add to `BUILDS_OVERRIDES` keyed by repo name for repos that should merge with API data. **Then run `node tools/build-projects.mjs`** — `BUILDS` also feeds the static mirror that non-JS crawlers read.
- **Exclude a repo**: add `'repo-name': {skipApi:true}` to `BUILDS_OVERRIDES`.
- **Deep-link into a panel**: `#bio`, `#work`, `#projects` open a tab; `#builds`, `#writing`, `#events`, `#community` open the projects tab on that subtab. The archive pages and the footer use these. The subtab is selected by the stagger call at the *bottom* of the script, which runs last — setting it earlier gets overwritten.
- **Swap photos**: drop files into `photos/` (color is fine, CSS converts to B/W), update the `src` in that event's `pics[]` or in the bio `<figure>`s, then run `node tools/build-gallery.mjs`. Name files descriptively — the filename is itself an image-search signal, so `daniel-uusitalo-machn-leipzig-2026.jpg` beats `contact-04.jpg`.
- **Bump version**: the version string lives in **4** places — update all four when releasing: (1) the `<!-- v0.x.x -->` comment near line 5, (2) the hero `.meta` span `V0.x.x`, (3) the footer `V0.x.x` line, and (4) **`DEMO_COMMITS`** — *if* it still carries a `feat: ship v0.x.x` entry. As of v0.12.0 it does not; the fallback feed is all undated placeholder commits. Check before hunting for a fourth occurrence. Also update `currently v0.x.x` in this file's first paragraph. Search for the current version to find them all.

  The footer also carries a hardcoded `DEPLOYED YYYY.MM.DD` — it is the only date readout on the page that is not computed, so it goes stale the next time you push without touching it. Update it in the same pass.
- **Refresh the contribution heatmap**: `node tools/build-contributions.mjs`. **Since 2026-09-19 a GitHub Action does this for you** (`.github/workflows/contributions.yml`): every six hours at :17, on every push to `master`, and on a `workflow_dispatch` button in the Actions tab. You should never need to run it by hand. It commits to `master`, which is also the deploy. The push trigger does not recurse — a commit made with `GITHUB_TOKEN` cannot start another workflow run, which is GitHub's own loop protection, not something this file arranges. Expect roughly one bot commit whenever the numbers actually move, and one a week otherwise — the generator refuses to rewrite the file just to bump its own snapshot date, but refreshes anyway every 7 days so `--check`'s staleness guard stays meaningful. The grid is a fixed 12-month window because that is all GitHub's fragment serves, and there is nothing earlier to show — full-year fetches for 2023, 2024 and 2025 all return zero active days, the account's first public repo being from 2026-02-17. **Commits only reach this graph if their author email is on the GitHub account**, so an unrecognised `git config user.email` silently deletes work from it.

  Two traps in that script, both hit on 2026-09-19 and both now guarded:

  - **GitHub's calendar lags its own commits API.** Adding an email to the account re-attributes past commits within the hour, but the calendar is a cached aggregate and rebuilds on its own schedule; eight days were still short, one of them showing zero against three pushed commits. There is no way to force the rebuild from outside. The script therefore fetches every default-branch commit from every non-fork repo and takes `max(calendar[day], attributedCommits[day])`. That can only raise a day to a number of commits that provably exist, each nameable by SHA, and it becomes a no-op once GitHub catches up — which is why it stays in permanently instead of being a one-off patch. Private repos still come from the calendar, the only source for them.
  - **The fragment is row-major, not column-major.** It is seven `<tr>`, one per weekday, each holding 53 `<td>`. Document order is therefore every Sunday, then every Monday, and so on. Slicing that into sevens builds a "week" out of seven consecutive Sundays and ships a scrambled grid that still looks plausible at a glance — check the `title` attributes within one `.gh-col`, they must be consecutive dates. The script now sorts by date and asserts there is no gap before rendering.
- **Commit log**: `CFG.GITHUB_USER = "danieljpuusitalo"`. Pulls public push events from the GitHub API on load; falls back to labelled `DEMO_COMMITS` when there are none. No token, no server.

## Voice rules

Concise, data-anchored, Nordic-humility-with-an-edge. No self-aggrandizing first person ("I lead", "I source" → describe the work, not the ego). No generic VC filler. Playful is fine ("flash tax", "PILGRIMAGE"), cringe is not.

- **No em dashes, and no `--` standing in for one.** Anywhere a visitor can read: page copy, `alt` text, captions, data arrays, the README. Recast the sentence, or use a colon, a comma, or a full stop. Daniel asked for this explicitly (2026-09-12) and the site was swept clean of them; a reintroduced one is a regression.

  En dashes stay where they are typographically correct — date and number ranges only (`2022–2023`, `15–16 Sep`). CSS custom properties (`var(--fg)`), CLI flags (`--check`) and the `--:--:--` clock placeholder are not prose and are obviously fine.

## Analytics

Cookieless GoatCounter analytics is live (`danieluusitalo.goatcounter.com`), wired into all five HTML files (`index.html`, `writing.html`, `press-kit.html`, `gallery.html`, `404.html`). Footer copy updated to "no cookies".

## Facts already verified (don't re-research)

LinkedIn `/in/danieljpuusitalo`, GitHub `danieljpuusitalo`, Medium `@danieljpuusitalo`, X `@Daniel_Uusitalo`. Career: Helen Ventures (energy CVC) before 4impact; Aalto MSc, Brunel BSc; WEF Global Shaper, Climate Reality Leader, Davos50 Delegate WEF 2025; ArcticStartup contributor. Fund II: €68M, closed 11/2024, EIF + Invest-NL, SFDR Art. 9.

## Verification before calling anything done

Run all four drift checks — they are the cheap half and they catch the failure nobody notices, a mirror quietly going stale:

```
node tools/build-writing.mjs       --check
node tools/build-gallery.mjs      --check
node tools/build-projects.mjs     --check
node tools/build-contributions.mjs --check
```

Then open `index.html` in a browser: check all three tabs + subtabs, filter chips, lightbox (click photo, Esc closes), no console errors. Also check ~390px width (mobile layout shifts). Print preview: all three panels present, writing + events visible. Negative mode [D]: verify constellation NYC visible in both modes.

If you touched schema, re-parse it rather than trusting `--check`, which only proves two files agree and will happily confirm that both are broken the same way:

```
node -e "const h=require('fs').readFileSync('gallery.html','utf8');JSON.parse(h.match(/ld\+json\">([\s\S]*?)<\/script>/)[1]);console.log('ok')"
```

**If you changed anything a crawler reads**, confirm it survives without JavaScript. Strip `<script>` and `<style>` from the file and check the content is still in the text — that is exactly what the non-Google crawlers see. The projects mirror exists because that check failed in the 2026-09-12 audit.

## Deploy

GitHub Pages (repo root, `index.html` is the entry). `.nojekyll` present. Custom domain `danieluusitalo.com` via the `CNAME` file + GoDaddy DNS (4 A records `@` → `185.199.108–111.153`, `www` CNAME → `danieljpuusitalo.github.io`), Enforce HTTPS on. All absolute URLs (canonical, `og:url`, `og:image`, JSON-LD, `sitemap.xml`, `robots.txt`) use `https://danieluusitalo.com/` at ROOT — no `/danieljpuusitalo/` subpath. Verified in Google Search Console as a Domain property (DNS TXT); sitemap submitted.
