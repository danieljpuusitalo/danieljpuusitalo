# danieljpuusitalo — personal site

Single-file personal website. Black & white, editorial, flash-photography identity. v0.5.0 "the flash field" — cursor-reactive halftone field, viewfinder cursor, shutter-wipe tabs, negative-film mode.

## Run

Open `index.html` in a browser. That's it — no build, no install.

## Edit

Content lives in JS arrays at the bottom of `index.html` (`WRITING`, `EVENTS`, `BUILDS`, `PHOTOS`) plus `EDIT:`-marked HTML for static copy. Full conventions and recipes: **CLAUDE.md** (also read automatically by Claude Code).

## Continue with Claude Code

```
cd <this folder>
git init && git add . && git commit -m "v0.4.0"
claude
```

Claude Code reads `CLAUDE.md` on start and will know the architecture, design rules, and roadmap. Suggested first prompts: "add my latest article to the wire", "swap the contact sheet to photos in ./photos", "wire BUILDS to my public GitHub repos".

## Deploy

Drag `index.html` into [Netlify Drop](https://app.netlify.com/drop), or push to GitHub and enable Pages.

## Keys

`1` `2` `3` tabs · `G` grid · `F` flash · `D` negative mode · `←` `→` lightbox nav · `Esc` close
