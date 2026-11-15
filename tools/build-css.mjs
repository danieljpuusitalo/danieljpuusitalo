#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   build-css.mjs / copy tools/base.css into every page's <head>

   Why this exists
   ───────────────
   The site has no build step and no external stylesheet: each page
   carries its own <style>. That left five copies of the colour tokens
   drifting apart (404.html had none, only raw hex). tools/base.css is
   now the single source; this script writes it into each page as a
   whole <style> element between <!-- GEN:BASECSS --> markers, placed
   before the page's own <style> so the page can still override it.

   index.html gets the whole file (tokens plus the shared base). The
   other four pages get the TOKENS section only, the part above the
   END TOKENS line, so their own rules keep working unchanged.

   Usage:
     node tools/build-css.mjs           rewrite the pages
     node tools/build-css.mjs --check   exit 1 if any page has drifted
   ═══════════════════════════════════════════════════════════════════ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { splice, die } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'tools', 'base.css');
const CUT = '/* ═══ END TOKENS';

const css = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n').trim();
const at = css.indexOf(CUT);
if (at === -1) die(`tools/base.css has no "${CUT}" line to split the tokens off at.`);
/* A comment marker inside the CSS would end the GEN comment early. */
if (css.includes('-->') || css.includes('<!--')) die('tools/base.css must not contain an HTML comment marker.');
if (/<\/style/i.test(css)) die('tools/base.css must not contain a closing style tag.');

const full = css;
const tokens = css.slice(0, css.indexOf('\n', at)).trim();

const PAGES = [
  ['index.html', full],
  ['writing.html', tokens],
  ['gallery.html', tokens],
  ['press-kit.html', tokens],
  ['404.html', tokens],
];

const check = process.argv.includes('--check');
const drifted = [];
let wrote = 0;
for (const [page, body] of PAGES) {
  const file = join(ROOT, page);
  const html = readFileSync(file, 'utf8');
  const next = splice(html, 'BASECSS', `<style>\n${body}\n</style>`, page);
  if (html === next) continue;
  if (check) { drifted.push(page); continue; }
  writeFileSync(file, next);
  wrote++;
}

if (check) {
  if (drifted.length) {
    die(`base CSS is OUT OF SYNC with tools/base.css in: ${drifted.join(', ')}.\n` +
        '    Run: node tools/build-css.mjs');
  }
  console.log(`\n  ✓ base CSS is in sync (${PAGES.length} pages).\n`);
} else if (!wrote) {
  console.log(`\n  = base CSS already up to date (${PAGES.length} pages).\n`);
} else {
  console.log(`\n  ✓ wrote base CSS into ${wrote} of ${PAGES.length} pages.\n`);
}
