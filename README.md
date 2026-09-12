# danieljpuusitalo

Personal website of Daniel Uusitalo, European venture capitalist and environmental activist. Hand-written static site deployed on GitHub Pages at [danieluusitalo.com](https://danieluusitalo.com).

Black & white editorial identity, cursor-reactive halftone field, viewfinder cursor, shutter-wipe tabs, negative-film mode. No framework, no bundler, no dependencies except Google Fonts.

## Structure

`index.html` holds the whole main page: CSS, HTML, JS and data in a single file. Alongside it sit four companion pages:

| File | Purpose |
|------|---------|
| `index.html` | The main site |
| `writing.html` | Crawlable writing archive, **generated**, see below |
| `press-kit.html` | Press kit: headshots, bios, speaking topics |
| `gallery.html` | Photo archive |
| `404.html` | Custom error page |

## Run locally

Open `index.html` in a browser. No install, no bundler.

## Edit content

All content lives in JS arrays at the bottom of `index.html`: `WRITING`, `EVENTS`, `BUILDS`, `PHOTOS`. Edit the arrays, refresh the browser. Full conventions in `CLAUDE.md`.

Writing is ordered by date, not by array position; paste a new entry anywhere and it lands correctly.

## Regenerate the writing archive

`writing.html` is generated from the `WRITING` array, because the homepage wire is client-rendered and invisible to crawlers that don't execute JavaScript. After editing `WRITING`:

```sh
node tools/build-writing.mjs          # regenerate
node tools/build-writing.mjs --check  # exit 1 if out of sync
```

Zero dependencies. It is a maintenance script you run by hand, not a build step; the site still deploys as plain static files.

## Deploy

Hosted via GitHub Pages from the `master` branch root. Pushes to `master` deploy automatically.

## Keys

`1` `2` `3` tabs | `G` grid | `F` flash | `D` negative mode | `<` `>` lightbox nav | `Esc` close
