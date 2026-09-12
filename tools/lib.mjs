/* ═══════════════════════════════════════════════════════════════════
   lib.mjs / shared helpers for the tools/ maintenance scripts

   index.html is the only place content lives. These helpers are how a
   generator reads an array back out of it without a parser, a bundler
   or a single npm dependency.

   Used by build-writing.mjs and build-gallery.mjs. Nothing here runs at
   deploy time: the site is still plain static files.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync } from 'node:fs';

export const die = (msg) => { console.error(`\n  ✗ ${msg}\n`); process.exit(1); };

/* ── read a `const NAME = [ … ];` array out of a source file ────────
   Bracket-matched so a `]` inside a title can never truncate the
   array, and comment/string aware so an apostrophe inside a block
   comment does not read as an unterminated string and swallow the
   rest of the file. */
export function readArray(file, name) {
  const src = readFileSync(file, 'utf8');
  const decl = `const ${name} = [`;
  const start = src.indexOf(decl);
  if (start === -1) die(`Could not find \`${decl}\` in ${file}.`);
  const open = src.indexOf('[', start);

  let depth = 0, end = -1, inStr = null, inCom = null;
  for (let i = open; i < src.length; i++) {
    const c = src[i], next = src[i + 1], prev = src[i - 1];
    if (inCom) {
      if (inCom === 'line' && c === '\n') inCom = null;
      else if (inCom === 'block' && c === '*' && next === '/') { inCom = null; i++; }
      continue;
    }
    if (inStr) { if (c === inStr && prev !== '\\') inStr = null; continue; }
    if (c === '/' && next === '/') { inCom = 'line'; i++; continue; }
    if (c === '/' && next === '*') { inCom = 'block'; i++; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === '[') depth++;
    else if (c === ']') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end === -1) die(`Unbalanced brackets in the ${name} array.`);

  try { return new Function(`return ${src.slice(open, end + 1)}`)(); }
  catch (e) { die(`${name} array is not valid JS: ${e.message}`); }
}

/* "2026.09" -> 202609 · "2025" -> 202500 (year-only sorts below every
   month of that year) · malformed -> -1, which validators reject.
   Mirrors dkey() in index.html. */
export function dkey(d) {
  const m = String(d).match(/^(\d{4})(?:\.(\d{1,2}))?$/);
  if (!m) return -1;
  return +m[1] * 100 + (m[2] ? +m[2] : 0);
}

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* "2026.09" -> "2026-09" */
export const isoDate = (d) => String(d).replace('.', '-');

/* ── JPEG pixel dimensions, no dependencies ────────────────────────
   Walks the marker segments to the first SOF (start of frame). Explicit
   width/height on every <img> is what stops the archive from shifting
   layout as photos load. */
export function jpegSize(file) {
  const b = readFileSync(file);
  if (b[0] !== 0xff || b[1] !== 0xd8) die(`${file} is not a JPEG.`);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const marker = b[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = b.readUInt16BE(i + 2);
    // SOF0/1/2/3/5/6/7/9/10/11/13/14/15 carry the frame header. DHT/JPG/DAC do not.
    const isSOF = marker >= 0xc0 && marker <= 0xcf &&
                  marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  die(`Could not read dimensions from ${file}.`);
}

/* ── splice generated HTML between <!-- GEN:NAME --> markers ───────── */
export function splice(text, name, body, label) {
  const open = `<!-- GEN:${name} -->`, close = `<!-- /GEN:${name} -->`;
  const a = text.indexOf(open), b = text.indexOf(close);
  if (a === -1 || b === -1) die(`Missing ${open} … ${close} markers in ${label}.`);
  return text.slice(0, a + open.length) + '\n' + body + '\n' + text.slice(b);
}
