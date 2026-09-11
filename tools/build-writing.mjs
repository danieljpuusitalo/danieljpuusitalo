#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   build-writing.mjs — regenerate writing.html from index.html's WRITING

   The homepage writing wire is client-rendered, so crawlers that don't
   execute JavaScript (OpenAI, Anthropic and Perplexity crawlers all
   execute none) see nothing. writing.html is the static mirror that
   fixes that. This script keeps the two in sync so adding an article
   stays a ONE-place edit.

   Usage:
     node tools/build-writing.mjs           rewrite writing.html
     node tools/build-writing.mjs --check   exit 1 if out of sync

   No dependencies, no npm, no bundler. This is a maintenance script you
   run by hand, NOT a build step — the site still deploys as plain static
   files. That distinction is what keeps CLAUDE.md's architecture rule
   intact.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');
const OUT = join(ROOT, 'writing.html');
const PERSON = 'https://danieluusitalo.com/#person';

/* Which section a piece belongs to, and whether he WROTE it or it is
   ABOUT him. Unknown types throw — never guess this, it is both a
   factual claim and a schema claim. */
const KIND = {
  OPED: 'by', COLUMN: 'by', BLOG: 'by', ARTICLE: 'by',
  INTERVIEW: 'about', QUOTED: 'about', FEATURE: 'about',
};

const die = (msg) => { console.error(`\n  ✗ ${msg}\n`); process.exit(1); };

/* ── extract WRITING from index.html ─────────────────────────────── */
function readWriting() {
  const src = readFileSync(SRC, 'utf8');
  const start = src.indexOf('const WRITING = [');
  if (start === -1) die('Could not find `const WRITING = [` in index.html.');
  const open = src.indexOf('[', start);

  // Bracket-match so a `]` inside a title can never truncate the array.
  // Must understand strings AND comments — an apostrophe in a `/* … */`
  // note would otherwise read as an unterminated string and swallow
  // the rest of the file.
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
  if (end === -1) die('Unbalanced brackets in the WRITING array.');

  let list;
  try { list = new Function(`return ${src.slice(open, end + 1)}`)(); }
  catch (e) { die(`WRITING array is not valid JS: ${e.message}`); }

  // Validate before emitting anything.
  const seen = new Set();
  list.forEach((w, i) => {
    for (const f of ['d', 'src', 'type', 'title', 'url']) {
      if (!w[f]) die(`Entry ${i} ("${w.title || '?'}") is missing \`${f}\`.`);
    }
    if (!KIND[w.type]) {
      die(`Entry ${i} ("${w.title}") has unknown type "${w.type}".\n` +
          `    Known: ${Object.keys(KIND).join(', ')}\n` +
          `    Add it to KIND in this script and decide: authored or about?`);
    }
    if (dkey(w.d) < 0) {
      die(`Entry ${i} ("${w.title}") has a malformed date "${w.d}".\n` +
          `    Use "YYYY.MM" (e.g. 2026.09) or "YYYY" if the month is unknown.`);
    }
    const mo = String(w.d).split('.')[1];
    if (mo !== undefined && (+mo < 1 || +mo > 12)) {
      die(`Entry ${i} ("${w.title}") has month "${mo}" in date "${w.d}" — must be 01-12.`);
    }
    if (seen.has(w.url)) die(`Duplicate URL: ${w.url}`);
    seen.add(w.url);
  });

  // Date is the ordering authority — array order is irrelevant.
  // Mirrors WRITING_SORTED in index.html.
  const sorted = [...list].sort((a, b) => dkey(b.d) - dkey(a.d));
  const drifted = sorted.findIndex((w, i) => w !== list[i]);
  if (drifted !== -1) {
    console.log(`\n  · note: the WRITING array is not in date order (first at index ` +
                `${drifted}, "${sorted[drifted].title.slice(0, 40)}…").\n` +
                `    Output is sorted correctly regardless — tidy the array only if you want to.`);
  }
  return sorted;
}

/* "2026.09" -> 202609 · "2025" -> 202500 (year-only sorts below every
   month of that year) · malformed -> -1, which the validator rejects. */
function dkey(d) {
  const m = String(d).match(/^(\d{4})(?:\.(\d{1,2}))?$/);
  if (!m) return -1;
  return +m[1] * 100 + (m[2] ? +m[2] : 0);
}

/* ── helpers ─────────────────────────────────────────────────────── */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isoDate = (d) => String(d).replace('.', '-');           // 2026.09 -> 2026-09
const titleCase = (s) => s.charAt(0) + s.slice(1).toLowerCase();

const row = (w) => {
  const note = w.note || (KIND[w.type] === 'about' ? titleCase(w.type) : '');
  const noteHtml = note ? `\n        <span class="wnote">${esc(note)}</span>` : '';
  return `
    <a class="wrow" href="${esc(w.url)}" rel="noopener">
      <span class="wdate">${esc(w.d)}</span><span class="wsrc">${esc(w.src)}</span>
      <span class="wtitle">${esc(w.title)}${noteHtml}</span><span class="warr">&nearr;</span></a>
`;
};

const articleNode = (w) => {
  const n = {
    '@type': 'Article', '@id': w.url, url: w.url, name: w.title,
    datePublished: isoDate(w.d),
  };
  if (w.lang) n.inLanguage = w.lang;
  // Authored work asserts `author`; work about him asserts `about`.
  if (KIND[w.type] === 'by') n.author = { '@id': PERSON };
  else n.about = { '@id': PERSON };
  n.publisher = { '@type': 'Organization', name: w.src };
  return n;
};

/* ── build ───────────────────────────────────────────────────────── */
function build(list) {
  const by = list.filter((w) => KIND[w.type] === 'by');
  const about = list.filter((w) => KIND[w.type] === 'about');

  const graph = [
    {
      '@type': 'CollectionPage',
      '@id': 'https://danieluusitalo.com/writing.html#webpage',
      url: 'https://danieluusitalo.com/writing.html',
      name: 'Writing archive — Daniel Uusitalo',
      description: 'Articles, op-eds and columns by Daniel Uusitalo, plus interviews and commentary published about him.',
      inLanguage: 'en',
      isPartOf: { '@id': 'https://danieluusitalo.com/#webpage' },
      about: { '@id': PERSON },
      mainEntity: { '@id': 'https://danieluusitalo.com/writing.html#authored' },
    },
    {
      '@type': 'Person', '@id': PERSON,
      name: 'Daniel Uusitalo', url: 'https://danieluusitalo.com/',
      subjectOf: about.map((w) => ({ '@id': w.url })),
    },
    {
      '@type': 'ItemList',
      '@id': 'https://danieluusitalo.com/writing.html#authored',
      name: 'Writing by Daniel Uusitalo',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: by.length,
      itemListElement: by.map((w, i) => ({
        '@type': 'ListItem', position: i + 1, item: { '@id': w.url },
      })),
    },
    ...by.map(articleNode),
    ...about.map(articleNode),
  ];

  /* The <script> wrapper is generated, not templated, so the GEN markers
     can sit OUTSIDE it. An HTML comment between <script type="application/
     ld+json"> and the opening `{` makes the block invalid JSON — strict
     parsers reject the whole graph — so the markers must never live
     inside the tag. */
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  const schema = `<script type="application/ld+json">\n${json}\n</script>`;

  const section = (heading, note, items) =>
    `  <h2>${heading}</h2>\n  <div class="snote">${note}</div>\n  <div class="wire">\n${items.map(row).join('')}\n  </div>`;

  return {
    schema,
    authored: section(
      'Written by Daniel Uusitalo',
      `Op-eds, columns and essays &middot; ${by.length} pieces &middot; newest first`,
      by),
    about: section(
      'Interviews &amp; commentary',
      `Published about Daniel Uusitalo, not by him &middot; ${about.length} pieces`,
      about),
    counts: { by: by.length, about: about.length, total: list.length },
  };
}

/* ── splice into writing.html between markers ────────────────────── */
function splice(html, name, body) {
  const open = `<!-- GEN:${name} -->`, close = `<!-- /GEN:${name} -->`;
  const a = html.indexOf(open), b = html.indexOf(close);
  if (a === -1 || b === -1) die(`Missing ${open} … ${close} markers in writing.html.`);
  return html.slice(0, a + open.length) + '\n' + body + '\n' + html.slice(b);
}

const list = readWriting();
const { schema, authored, about, counts } = build(list);

let html = readFileSync(OUT, 'utf8');
html = splice(html, 'SCHEMA', schema);
html = splice(html, 'AUTHORED', authored);
html = splice(html, 'ABOUT', about);

const check = process.argv.includes('--check');
const current = readFileSync(OUT, 'utf8');

if (check) {
  if (current !== html) {
    die('writing.html is OUT OF SYNC with the WRITING array in index.html.\n' +
        '    Run: node tools/build-writing.mjs');
  }
  console.log(`\n  ✓ writing.html is in sync (${counts.total} pieces: ${counts.by} authored, ${counts.about} about).\n`);
} else {
  if (current === html) {
    console.log(`\n  = writing.html already up to date (${counts.total} pieces).\n`);
  } else {
    writeFileSync(OUT, html);
    console.log(`\n  ✓ writing.html regenerated — ${counts.total} pieces: ` +
                `${counts.by} authored, ${counts.about} about.\n` +
                `    Every schema node maps 1:1 to a visible row.\n`);
  }
}
