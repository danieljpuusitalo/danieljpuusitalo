#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   build-projects.mjs / mirror index.html's BUILDS array into static
   HTML inside #builds-grid, in the same file

   Why this exists
   ───────────────
   The projects grid is client-rendered: renderBuildCards() clears
   #builds-grid and rebuilds it, first from BUILDS and then again from
   the GitHub API. Anything inside that container is therefore invisible
   to a crawler that does not execute JavaScript, and the grid sits
   inside two nested display:none panels on top of that.

   Audited 2026-09-12: a non-JS read of / returned the full BIO and WORK
   panels as static text but not one project name. The writing wire and
   the events grid have static mirrors (writing.html, gallery.html);
   the projects grid had none.

   So this writes the seven curated cards into the page as real HTML,
   byte-matching what renderBuildCards(BUILDS, false) produces. A
   browser wipes them ~instantly and renders the live version, which is
   plain progressive enhancement: the static copy is a faithful subset
   of the rendered one, never a substitute shown only to crawlers.

   API-only repos are deliberately absent. They have no editorial copy
   and change without anyone editing this repo, so freezing them into
   the markup would only guarantee a stale claim.

   Usage:
     node tools/build-projects.mjs           rewrite index.html
     node tools/build-projects.mjs --check   exit 1 if it has drifted

   No dependencies. A maintenance script you run by hand, NOT a build
   step; the site still deploys as plain static files.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readArray, esc, splice, die } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');

const BUILDS = readArray(SRC, 'BUILDS');

BUILDS.forEach((b, i) => {
  const who = `entry ${i} ("${b.name || '?'}")`;
  for (const f of ['num', 'name', 'desc', 'tags']) {
    if (!b[f]) die(`BUILDS ${who} is missing \`${f}\`.`);
  }
  if (!b.tags.length) die(`BUILDS ${who} has no tags.`);
  /* The desc is the only prose a non-JS crawler will ever see for this
     project, so a placeholder here is a silent content hole. */
  if (b.desc.trim().split(/\s+/).length < 8) {
    die(`BUILDS ${who} has a stub desc: "${b.desc}"`);
  }
});

/* Matches renderBuildCards() exactly: <a> when there is a link, <div>
   when there is not, same classes, same child order. If you change the
   renderer, change this too or the first paint will shift. */
const card = (b) => {
  const link = b.gh || b.url || '';
  const open = link
    ? `<a class="proj" href="${esc(link)}" target="_blank" rel="noopener">`
    : '<div class="proj">';
  const close = link ? '</a>' : '</div>';
  return `      ${open}<span class="pnum">${esc(b.num)}</span><h3>${esc(b.name)}</h3>` +
    `<p class="pdesc">${esc(b.desc)}</p>` +
    `<div class="ptags">${b.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` +
    `${close}`;
};

const body = BUILDS.map(card).join('\n');

let html = readFileSync(SRC, 'utf8');
const next = splice(html, 'BUILDS', body, 'index.html');

const check = process.argv.includes('--check');
if (check) {
  if (html !== next) {
    die('index.html\'s static projects mirror is OUT OF SYNC with the BUILDS array.\n' +
        '    Run: node tools/build-projects.mjs');
  }
  console.log(`\n  ✓ static projects mirror is in sync (${BUILDS.length} cards).\n`);
} else if (html === next) {
  console.log(`\n  = static projects mirror already up to date (${BUILDS.length} cards).\n`);
} else {
  writeFileSync(SRC, next);
  console.log(`\n  ✓ regenerated the static projects mirror in index.html: ` +
              `${BUILDS.length} cards.\n` +
              `    Every card maps 1:1 to an entry in BUILDS.\n`);
}
