#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   check-entity.mjs / regression guard for what search engines read

   The site's entity signals (the Person graph, the canonical bio, head
   meta, headings, image URLs, sitemap) are easy to damage by accident
   during a visual change, and nothing visible breaks when they go. This
   script pins them so a redesign has to break them on purpose.

   Four kinds of assertion:

     FIXED      must equal tools/entity-baseline.json: the index @graph,
                press-kit JSON-LD, head meta on all five pages, every
                h1, the index and writing h2s, the bio <img>s, the hero
                one-liner, the sitemap <loc> set, and the canonical bio
                in every place it has to appear byte-identical.
     DERIVED    recomputed from the arrays in index.html, so adding an
                article, a photo or a project never false-fails:
                writing.html Article nodes, gallery anchors, ImageObjects
                and sitemap images, and the static project cards.
     MONOTONIC  no @id, JSON-LD/sitemap URL or image URL in the baseline
                may disappear. New ones are always allowed.
     VOICE      the forbidden role word appears nowhere; no em dash and
                no `--` stand-in in visitor-facing text (CLAUDE.md).

   Excluded everywhere: the GEN:CONTRIB block (a bot rewrites it every
   six hours) and the `--:--:--` clock placeholder.

   Usage:
     node tools/check-entity.mjs                    check, exit 1 on failure
     node tools/check-entity.mjs --write-baseline   re-capture the baseline
     node tools/check-entity.mjs --root DIR         check a copy of the site

   Re-capture the baseline only for a deliberate change to what crawlers
   read, and read the diff of entity-baseline.json before committing it.

   No dependencies. A maintenance script you run by hand, NOT a build
   step; the site still deploys as plain static files.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { readArray, dkey, jpegSize, die } from './lib.mjs';

const TOOLS = dirname(fileURLToPath(import.meta.url));
const REPO = join(TOOLS, '..');
const BASELINE = join(TOOLS, 'entity-baseline.json');
const SITE = 'https://danieluusitalo.com';
const PERSON = `${SITE}/#person`;
const PAGES = ['index.html', 'writing.html', 'gallery.html', 'press-kit.html', '404.html'];

const argv = process.argv.slice(2);
const WRITE = argv.includes('--write-baseline');
const rootAt = argv.indexOf('--root');
if (rootAt !== -1 && !argv[rootAt + 1]) die('--root needs a directory.');
const ROOT = rootAt !== -1 ? resolve(argv[rootAt + 1]) : REPO;

/* ── text helpers ──────────────────────────────────────────────────── */
const CONTRIB = /<!-- GEN:CONTRIB -->[\s\S]*?<!-- \/GEN:CONTRIB -->/g;
const CLOCK = '--:--:--';

/* Raw page with the bot-written block cut out, so nothing below can
   ever depend on a heatmap count. */
const load = (f) => readFileSync(join(ROOT, f), 'utf8').replace(/\r\n/g, '\n').replace(CONTRIB, '');

/* Markup only: no comments, scripts or styles. */
const strip = (h) => h
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '');

const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', mdash: '\u2014',
  ndash: '\u2013', middot: '·', hellip: '…', copy: '\u00a9', rsquo: '\u2019',
  lsquo: '\u2018', rdquo: '\u201d', ldquo: '\u201c', larr: '\u2190', rarr: '\u2192',
  nearr: '\u2197', darr: '\u2193', uarr: '\u2191', times: '\u00d7',
};
const decode = (s) => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m);

/* Inline text of a fragment: tags vanish (so `<b>` and `<span>` do not
   split words), <br> becomes a space, whitespace collapses. */
const text = (h) => decode(h.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ''))
  .replace(/\s+/g, ' ').trim();

/* Reading text of a whole page: every tag becomes a space, so adjacent
   cells cannot fuse into something they never said. */
const reading = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function attrs(src) {
  const out = {};
  for (const m of src.matchAll(/([^\s"'=<>\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '');
  }
  return out;
}

/* Every opening tag, with parsed attributes and its offset. */
function* openTags(h, name = '[a-zA-Z][\\w:-]*') {
  for (const m of h.matchAll(new RegExp(`<(${name})\\b([^>]*)>`, 'gi'))) {
    yield { tag: m[1].toLowerCase(), a: attrs(m[2]), at: m.index, raw: m[0] };
  }
}

/* The element that opens at `start`, matched by counting its own tag. */
function element(h, start) {
  const tag = h.slice(start + 1).match(/^[a-zA-Z][\w-]*/)[0].toLowerCase();
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
  re.lastIndex = start;
  let depth = 0, openEnd = -1, m;
  while ((m = re.exec(h))) {
    if (m[1]) { if (--depth === 0) return { start, innerAt: openEnd, inner: h.slice(openEnd, m.index), end: re.lastIndex }; }
    else { if (openEnd === -1) openEnd = re.lastIndex; depth++; }
  }
  return null;
}
const byId = (h, id) => { for (const t of openTags(h)) if (t.a.id === id) return element(h, t.at); return null; };
const byClass = (h, c) => {
  for (const t of openTags(h)) if ((t.a.class || '').split(/\s+/).includes(c)) return element(h, t.at);
  return null;
};
const all = (h, tag) => [...h.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))].map((m) => text(m[1]));

/* ── extractors ────────────────────────────────────────────────────── */
function headMeta(raw) {
  const head = ((raw.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [])[1] || '').replace(/<!--[\s\S]*?-->/g, '');
  const out = {};
  const put = (k, v) => { (out[k] ||= []).push(v); };
  const t = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  if (t) put('title', text(t[1]));
  for (const { a } of openTags(head, 'meta')) {
    const k = a.property || a.name;
    if (k && 'content' in a && (k === 'description' || k === 'robots' || /^(og|twitter):/.test(k))) put(k, a.content);
  }
  for (const { a } of openTags(head, 'link')) {
    if ((a.rel || '').split(/\s+/).includes('canonical')) put('canonical', a.href);
  }
  return Object.fromEntries(Object.keys(out).sort().map((k) => [k, out[k].length === 1 ? out[k][0] : out[k]]));
}

function jsonld(raw, file, fails) {
  return [...raw.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map((m) => {
      try { return JSON.parse(m[1]); }
      catch (e) { fails.push(['fixed', `${file}: a JSON-LD block does not parse (${e.message})`]); return null; }
    }).filter(Boolean);
}

function walk(v, fn, key) {
  if (Array.isArray(v)) v.forEach((x) => walk(x, fn, key));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, fn, k);
  else if (typeof v === 'string') fn(v, key);
}

const IMG = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i;
const abs = (u) => /^https?:\/\//.test(u) ? u : u.startsWith('//') ? `https:${u}` : `${SITE}/${u.replace(/^\.?\//, '')}`;

/* JS string literals in a source fragment, comment and template aware.
   Used on the DATA block only, which holds no regex literals. */
function jsStrings(src) {
  const out = [], braces = [];
  let depth = 0;
  const unesc = (s) => s.replace(/\\u\{([0-9a-f]+)\}|\\u([0-9a-f]{4})/gi, (_, a, b) => String.fromCodePoint(parseInt(a || b, 16)));
  for (let i = 0; i < src.length; i++) {
    const c = src[i], n = src[i + 1];
    if (c === '/' && n === '/') { i = src.indexOf('\n', i); if (i === -1) break; continue; }
    if (c === '/' && n === '*') { i = src.indexOf('*/', i + 2) + 1; if (i === 0) break; continue; }
    if (c === '"' || c === "'") {
      let s = '';
      for (i++; i < src.length && src[i] !== c; i++) { if (src[i] === '\\') s += src[i++]; s += src[i]; }
      out.push(unesc(s)); continue;
    }
    if (c === '`' || (c === '}' && braces.length && braces[braces.length - 1] === depth)) {
      if (c === '}') { braces.pop(); depth--; }
      let s = '';
      for (i++; i < src.length; i++) {
        if (src[i] === '\\') { s += src[i] + src[i + 1]; i++; continue; }
        if (src[i] === '`') break;
        if (src[i] === '$' && src[i + 1] === '{') { depth++; braces.push(depth); i++; break; }
        s += src[i];
      }
      out.push(unesc(s)); continue;
    }
    if (c === '{') depth++;
    else if (c === '}') depth--;
  }
  return out;
}

/* ── hero visibility: a small cascade over the page's own CSS ─────────
   The hero one-liner is the only sentence above the fold that names the
   employer. It stays visible today only because `.hero .sub` outranks
   `.sub{display:none}`, so this resolves `display` for the paragraph and
   every ancestor, with html.js on and off, under the base styles and
   each non-print @media block. Selectors it cannot evaluate statically
   (attributes, siblings, state pseudo-classes) are treated as not
   matching. It answers "is this display:none", nothing more. */
function cssRules(css) {
  const rules = [];
  let order = 0;
  (function parse(s, media) {
    let i = 0;
    while (i < s.length) {
      const open = s.indexOf('{', i);
      if (open === -1) break;
      const prelude = s.slice(i, open).trim();
      let d = 1, j = open + 1;
      for (; j < s.length && d; j++) { if (s[j] === '{') d++; else if (s[j] === '}') d--; }
      const block = s.slice(open + 1, j - 1);
      if (/^@media/i.test(prelude)) parse(block, prelude.slice(6).trim());
      else if (!prelude.startsWith('@')) rules.push({ sel: prelude, body: block, media, order: order++ });
      i = j;
    }
  })(css.replace(/\/\*[\s\S]*?\*\//g, ''), null);
  return rules;
}

function compound(s) {
  const m = s.match(/^([a-zA-Z][\w-]*|\*)?((?:\.[\w-]+|#[\w-]+|:not\([^()\s]+\))*)$/);
  if (!m || !s) return null;
  const c = { tag: m[1] && m[1] !== '*' ? m[1].toLowerCase() : null, cls: [], id: null, not: [], spec: [0, 0, m[1] && m[1] !== '*' ? 1 : 0] };
  for (const [p] of m[2].matchAll(/\.[\w-]+|#[\w-]+|:not\([^()\s]+\)/g)) {
    if (p[0] === '.') { c.cls.push(p.slice(1)); c.spec[1]++; }
    else if (p[0] === '#') { c.id = p.slice(1); c.spec[0]++; }
    else {
      const inner = compound(p.slice(5, -1));
      if (!inner) return null;
      c.not.push(inner); inner.spec.forEach((v, k) => { c.spec[k] += v; });
    }
  }
  return c;
}
const hit = (c, el) => (!c.tag || c.tag === el.tag) && (!c.id || c.id === el.id) &&
  c.cls.every((k) => el.classes.has(k)) && c.not.every((n) => !hit(n, el));

function selector(sel) {
  const toks = sel.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/);
  const parts = [];
  let comb = ' ';
  for (const t of toks) {
    if (t === '>') { comb = '>'; continue; }
    const c = compound(t);
    if (!c) return null;
    parts.push({ c, comb });
    comb = ' ';
  }
  if (!parts.length) return null;
  const spec = parts.reduce((s, p) => s.map((v, k) => v + p.c.spec[k]), [0, 0, 0]);
  return { parts, spec };
}
function matchAt(parts, k, chain, idx) {
  if (!hit(parts[k].c, chain[idx])) return false;
  if (k === 0) return true;
  if (parts[k].comb === '>') return idx > 0 && matchAt(parts, k - 1, chain, idx - 1);
  for (let j = idx - 1; j >= 0; j--) if (matchAt(parts, k - 1, chain, j)) return true;
  return false;
}
const splitList = (s) => {
  const out = [];
  let d = 0, cur = '';
  for (const ch of s) {
    if (ch === '(') d++; else if (ch === ')') d--;
    if (ch === ',' && !d) { out.push(cur); cur = ''; } else cur += ch;
  }
  return out.concat(cur);
};
const declared = (body, prop) => {
  const ms = [...body.matchAll(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;!]+?)\\s*(!\\s*important)?\\s*(?=;|$)`, 'gi'))];
  return ms.length ? { value: ms[ms.length - 1][1].trim().toLowerCase(), important: !!ms[ms.length - 1][2] } : null;
};

/* Ancestor chain (html first) of the element opening at `pos`. */
function chainTo(h, pos) {
  const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
  const stack = [];
  for (const m of h.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    if (m.index > pos) break;
    const tag = m[2].toLowerCase();
    if (m[1]) { const k = stack.map((e) => e.tag).lastIndexOf(tag); if (k !== -1) stack.length = k; continue; }
    const a = attrs(m[3]);
    const el = { tag, id: a.id || '', classes: new Set((a.class || '').split(/\s+/).filter(Boolean)), style: a.style || '', hidden: 'hidden' in a };
    if (m.index === pos) { stack.push(el); break; }
    if (!VOID.has(tag) && !/\/\s*$/.test(m[3])) stack.push(el);
  }
  return stack;
}

function hiddenBy(raw, h, pos) {
  const rules = cssRules([...raw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n'))
    .map((r) => ({ ...r, display: declared(r.body, 'display') }))
    .filter((r) => r.display);
  const medias = [...new Set(rules.map((r) => r.media).filter((m) => m && !/\bprint\b/i.test(m)))];
  const reasons = [];
  for (const js of [false, true]) {
    const chain = chainTo(h, pos);
    if (chain[0] && chain[0].tag === 'html' && js) chain[0] = { ...chain[0], classes: new Set([...chain[0].classes, 'js']) };
    for (const media of [null, ...medias]) {
      const live = rules.filter((r) => r.media === null || r.media === media);
      chain.forEach((el, idx) => {
        const who = el.tag + (el.id ? `#${el.id}` : '') + [...el.classes].map((c) => `.${c}`).join('');
        if (el.hidden) { reasons.push(`${who} has the hidden attribute`); return; }
        let best = null;
        /* rank = [!important, inline, id, class, tag, source order], compared left to right */
        const beats = (a, b) => { for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) return a[k] > b[k]; return true; };
        const consider = (value, rank, label) => { if (!best || beats(rank, best.rank)) best = { value, rank, label }; };
        for (const r of live) {
          for (const s of splitList(r.sel)) {
            const p = selector(s);
            if (p && matchAt(p.parts, p.parts.length - 1, chain, idx)) {
              consider(r.display.value, [r.display.important ? 1 : 0, 0, ...p.spec, r.order], s.trim());
            }
          }
        }
        const inline = declared(el.style, 'display');
        if (inline) consider(inline.value, [inline.important ? 1 : 0, 1, 0, 0, 0, Infinity], 'inline style');
        if (best && best.value === 'none') {
          reasons.push(`${who} is display:none via \`${best.label}\`` + (js ? ' with html.js' : '') + (media ? ` under @media ${media}` : ''));
        }
      });
    }
  }
  return [...new Set(reasons)];
}

/* ── read the site ─────────────────────────────────────────────────── */
const fails = [];
let checks = 0;
const expect = (ok, group, msg) => { checks++; if (!ok) fails.push([group, msg]); };
const short = (v, n = 90) => { const s = typeof v === 'string' ? v : JSON.stringify(v); return s.length > n ? `${s.slice(0, n)}…` : s; };

for (const f of [...PAGES, 'sitemap.xml']) if (!existsSync(join(ROOT, f))) die(`${f} not found under ${ROOT}.`);
const raw = Object.fromEntries(PAGES.map((f) => [f, load(f)]));
const dom = Object.fromEntries(PAGES.map((f) => [f, strip(raw[f])]));
const ld = Object.fromEntries(PAGES.map((f) => [f, jsonld(raw[f], f, fails)]));
const sitemap = load('sitemap.xml').replace(/<!--[\s\S]*?-->/g, '');
const INDEX = join(ROOT, 'index.html');

/* ── snapshot: everything the FIXED and MONOTONIC rules compare ─────── */
function snapshot() {
  const s = { pages: {}, h2: {} };
  for (const f of PAGES) s.pages[f] = { meta: headMeta(raw[f]), h1: all(dom[f], 'h1') };
  for (const f of ['index.html', 'writing.html']) s.h2[f] = all(dom[f], 'h2');

  const indexLd = ld['index.html'][0] || {};
  s.indexGraph = indexLd['@graph'] || null;
  s.pressKitJsonLd = ld['press-kit.html'];

  const bio = byId(dom['index.html'], 'bio');
  s.bioImages = bio ? [...openTags(bio.inner, 'img')].map(({ a }) => ({ src: a.src, alt: a.alt, width: a.width, height: a.height })) : null;

  const hero = byClass(dom['index.html'], 'hero');
  const h1At = hero ? hero.inner.search(/<\/h1>/i) : -1;
  const pAt = h1At === -1 ? -1 : hero.inner.slice(h1At).search(/<p\b/i);
  const lede = pAt === -1 ? null : element(hero.inner, h1At + pAt);
  s.heroLede = lede ? text(lede.inner) : null;
  s._ledeAt = lede ? hero.innerAt + h1At + pAt : -1;

  s.sitemapLocs = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1].trim()).sort();

  const ids = new Set(), urls = new Set(), images = new Set();
  for (const f of PAGES) {
    walk(ld[f], (v, k) => {
      if (k === '@id') ids.add(v);
      if (/^https?:\/\//.test(v)) { urls.add(v); if (IMG.test(v)) images.add(v); }
    });
    const m = s.pages[f].meta;
    for (const k of ['og:image', 'twitter:image']) [].concat(m[k] || []).forEach((u) => images.add(abs(u)));
    for (const { tag, a } of openTags(dom[f])) {
      if (tag === 'img' && a.src && !a.src.startsWith('data:')) images.add(abs(a.src));
      if (tag === 'a' && a.href && IMG.test(a.href)) images.add(abs(a.href));
    }
  }
  for (const [, u] of sitemap.matchAll(/<(?:image:)?loc>([^<]*)<\/(?:image:)?loc>/g)) {
    urls.add(u.trim());
    if (IMG.test(u)) images.add(u.trim());
  }
  s.monotonic = { ids: [...ids].sort(), urls: [...urls].sort(), images: [...images].sort() };
  return s;
}

/* Where the canonical bio lives in index.html's machine-readable layer.
   Found by value at capture time, then pinned by location. */
function bioLocations(s, bio) {
  const out = [];
  for (const [k, v] of Object.entries(s.pages['index.html'].meta)) if (v === bio) out.push(`meta ${k}`);
  for (const node of s.indexGraph || []) {
    for (const [k, v] of Object.entries(node)) if (v === bio) out.push(`json-ld ${node['@id']} ${k}`);
  }
  return out;
}
function resolveBio(s, loc) {
  const [kind, a, b] = loc.split(' ');
  if (kind === 'meta') return s.pages['index.html'].meta[a];
  const node = (s.indexGraph || []).find((n) => n['@id'] === a);
  return node ? node[b] : undefined;
}

/* ── structural diff with readable paths ───────────────────────────── */
function diff(want, got, path, out) {
  if (out.length >= 10) return out;
  const prim = (x) => x === null || typeof x !== 'object';
  if (Array.isArray(want) && Array.isArray(got)) {
    if (want.every(prim) && got.every(prim)) {
      const miss = want.filter((x) => !got.includes(x)), extra = got.filter((x) => !want.includes(x));
      miss.forEach((x) => out.push(`${path}: missing ${short(x)}`));
      extra.forEach((x) => out.push(`${path}: unexpected ${short(x)}`));
      if (!miss.length && !extra.length && want.join('\u0000') !== got.join('\u0000')) out.push(`${path}: same items, different order`);
      return out;
    }
    if (want.length !== got.length) out.push(`${path}: expected ${want.length} items, found ${got.length}`);
    for (let i = 0; i < Math.min(want.length, got.length); i++) {
      const id = want[i] && want[i]['@id'] ? `{${want[i]['@id'].replace(SITE, '')}}` : '';
      diff(want[i], got[i], `${path}[${i}]${id}`, out);
    }
    return out;
  }
  if (!prim(want) && !prim(got) && !Array.isArray(want) && !Array.isArray(got)) {
    for (const k of new Set([...Object.keys(want), ...Object.keys(got)])) {
      if (!(k in got)) out.push(`${path}.${k}: missing (was ${short(want[k], 60)})`);
      else if (!(k in want)) out.push(`${path}.${k}: unexpected (${short(got[k], 60)})`);
      else diff(want[k], got[k], `${path}.${k}`, out);
    }
    return out;
  }
  if (JSON.stringify(want) !== JSON.stringify(got)) out.push(`${path}: expected ${short(want)}, found ${short(got)}`);
  return out;
}
const same = (group, label, want, got) => {
  const d = diff(want, got, label, []);
  expect(!d.length, group, d.join('\n      '));
};

/* ── --write-baseline ──────────────────────────────────────────────── */
const now = snapshot();
const ledeAt = now._ledeAt;
delete now._ledeAt;

if (WRITE) {
  const BIO = text(byId(dom['index.html'], 'bio') ? (byId(dom['index.html'], 'bio').inner.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i) || [])[1] || '' : '');
  if (!BIO.startsWith('Daniel Uusitalo is ')) die('Could not read the canonical bio from the BIO panel\'s lead paragraph.');
  const locs = bioLocations(now, BIO);
  if (locs.length < 6) die(`The canonical bio sits in only ${locs.length} machine-readable places in index.html; expected 6.`);
  if (existsSync(BASELINE)) {
    const old = JSON.parse(readFileSync(BASELINE, 'utf8'));
    for (const k of ['ids', 'urls', 'images']) {
      const gone = old.monotonic[k].filter((x) => !now.monotonic[k].includes(x));
      if (gone.length) console.log(`  · dropped from monotonic ${k}: ${gone.join(', ')}`);
    }
  }
  const out = {
    _about: 'Captured by tools/check-entity.mjs --write-baseline. Re-capture only for a deliberate change to what crawlers read.',
    bio: BIO,
    bioLocations: locs,
    ...now,
  };
  writeFileSync(BASELINE, JSON.stringify(out, null, 2) + '\n');
  console.log(`\n  ✓ wrote tools/entity-baseline.json (bio in ${locs.length} index locations; ` +
              `${now.monotonic.ids.length} @ids, ${now.monotonic.urls.length} URLs, ${now.monotonic.images.length} images).`);
}

if (!existsSync(BASELINE)) die('tools/entity-baseline.json is missing. Run: node tools/check-entity.mjs --write-baseline');
const base = JSON.parse(readFileSync(BASELINE, 'utf8'));

/* ── FIXED ─────────────────────────────────────────────────────────── */
same('fixed', 'index.html @graph', base.indexGraph, now.indexGraph);
same('fixed', 'press-kit.html JSON-LD', base.pressKitJsonLd, now.pressKitJsonLd);
for (const f of PAGES) {
  same('fixed', `${f} head`, base.pages[f].meta, now.pages[f].meta);
  same('fixed', `${f} h1`, base.pages[f].h1, now.pages[f].h1);
}
for (const f of Object.keys(base.h2)) same('fixed', `${f} h2`, base.h2[f], now.h2[f]);
same('fixed', 'index.html bio <img>', base.bioImages, now.bioImages);
same('fixed', 'index.html hero one-liner', base.heroLede, now.heroLede);
same('fixed', 'sitemap.xml <loc>', base.sitemapLocs, now.sitemapLocs);

/* Explicit width/height must be the file's real size, or the box the
   browser reserves is a lie and the layout shifts as the photo lands. */
for (const im of now.bioImages || []) {
  if (!/\.jpe?g$/i.test(im.src || '')) continue;
  const file = existsSync(join(ROOT, im.src)) ? join(ROOT, im.src) : join(REPO, im.src);
  if (!existsSync(file)) { expect(false, 'fixed', `index.html bio <img> ${im.src}: file not found`); continue; }
  const { w, h } = jpegSize(file);
  expect(+im.width === w && +im.height === h, 'fixed',
    `index.html bio <img> ${im.src}: width/height ${im.width}x${im.height}, file is ${w}x${h}`);
}

/* The hero one-liner must not be display:none for anyone. */
if (ledeAt !== -1) {
  const why = hiddenBy(raw['index.html'], dom['index.html'], ledeAt);
  expect(!why.length, 'fixed', `index.html hero one-liner is hidden: ${why[0]}` +
    (why.length > 1 ? ` (and in ${why.length - 1} more viewport/script contexts)` : ''));
} else expect(false, 'fixed', 'index.html: no <p> after the h1 inside the .hero element');

/* ── canonical bio, byte-identical ─────────────────────────────────── */
for (const loc of base.bioLocations) {
  const got = resolveBio(now, loc);
  expect(got === base.bio, 'bio', `index.html ${loc}: ` + (got === undefined ? 'gone' : `differs from the canonical bio: ${short(got, 140)}`));
}
{
  const bio = byId(dom['index.html'], 'bio');
  const lead = bio && bio.inner.match(/<p\b[^>]*>([\s\S]*?)<\/p>/i);
  const got = lead ? text(lead[1]) : null;
  expect(got === base.bio, 'bio', `index.html BIO panel lead paragraph differs from the canonical bio: ${short(got, 140)}`);
}
for (const f of ['press-kit.html', 'writing.html']) {
  const body = (dom[f].match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, dom[f]])[1];
  expect(text(body).includes(base.bio), 'bio', `${f}: the canonical bio is not in the visible text, word for word`);
}

/* ── DERIVED ───────────────────────────────────────────────────────────
   build-writing / build-gallery / build-projects --check already prove
   the generated markup byte-equal to the arrays. What they cannot prove
   is that a redesign which rewrites a generator still emits the same
   entities, so these assert the invariants, not the markup. */
{
  const WRITING = readArray(INDEX, 'WRITING');
  const graph = (ld['writing.html'][0] || {})['@graph'] || [];
  const arts = graph.filter((n) => n['@type'] === 'Article');
  expect(arts.length === WRITING.length, 'derived', `writing.html: ${arts.length} Article nodes, WRITING has ${WRITING.length}`);
  const want = new Set(WRITING.map((w) => w.url)), have = new Set(arts.map((a) => a['@id']));
  for (const u of want) expect(have.has(u), 'derived', `writing.html: no Article node with @id ${u}`);
  for (const u of have) expect(want.has(u), 'derived', `writing.html: Article ${u} is not in WRITING`);
  for (const a of arts) {
    const links = [a.author, a.about].filter(Boolean);
    expect(links.length === 1 && links[0]['@id'] === PERSON && a.url === a['@id'], 'derived',
      `writing.html: Article ${a['@id']} must carry exactly one of author/about -> #person, and url === @id`);
  }
  const words = reading(dom['writing.html']);
  for (const w of WRITING) expect(words.includes(w.title), 'derived', `writing.html: title not visible: "${short(w.title, 70)}"`);
}
{
  const EVENTS = readArray(INDEX, 'EVENTS');
  const archive = [...EVENTS].sort((a, b) => dkey(b.k) - dkey(a.k)).filter((e) => !e.archived)
    .flatMap((e) => (e.pics || []).map((p, n) => ({ src: p.src, id: n === 0 ? e.slug : `${e.slug}-${n + 1}` })));
  const g = dom['gallery.html'];
  const figs = [...openTags(g, 'figure')].filter((t) => t.a.id).map((t) => {
    const el = element(g, t.at);
    const img = el && [...openTags(el.inner, 'img')][0];
    return { id: t.a.id, src: img ? img.a.src : null };
  });
  const listDiff = (label, want, got) => {
    const i = want.findIndex((x, k) => x !== got[k]);
    expect(want.length === got.length && i === -1, 'derived',
      `${label}: expected ${want.length}, found ${got.length}` +
      (i !== -1 ? `; first mismatch at #${i + 1}: expected ${want[i]}, found ${got[i] ?? 'nothing'}` : ''));
  };
  listDiff('gallery.html figure anchors (EVENTS order)', archive.map((p) => p.id), figs.map((f) => f.id));
  listDiff('gallery.html figure <img> src', archive.map((p) => p.src), figs.map((f) => f.src));
  const nodes = ((ld['gallery.html'][0] || {})['@graph'] || []);
  const objs = nodes.filter((n) => n['@type'] === 'ImageObject');
  listDiff('gallery.html ImageObject @id', archive.map((p) => `${SITE}/${p.src}`), objs.map((o) => o['@id']));
  listDiff('gallery.html ImageObject url', archive.map((p) => `${SITE}/gallery.html#${p.id}`), objs.map((o) => o.url));
  const gal = nodes.find((n) => n['@type'] === 'ImageGallery');
  expect(gal && gal.numberOfItems === archive.length, 'derived', `gallery.html: ImageGallery.numberOfItems should be ${archive.length}`);
  const block = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1])
    .find((u) => (u.match(/<loc>([^<]*)<\/loc>/) || [])[1] === `${SITE}/gallery.html`) || '';
  listDiff('sitemap.xml gallery <image:loc>', archive.map((p) => `${SITE}/${p.src}`),
    [...block.matchAll(/<image:loc>([^<]*)<\/image:loc>/g)].map((m) => m[1].trim()));
}
{
  const BUILDS = readArray(INDEX, 'BUILDS');
  const grid = byId(dom['index.html'], 'builds-grid');
  const got = grid ? all(grid.inner, 'h3') : [];
  const want = BUILDS.map((b) => b.name);
  expect(JSON.stringify(got) === JSON.stringify(want), 'derived',
    `index.html #builds-grid h3s do not match BUILDS: expected ${short(want, 200)}, found ${short(got, 200)}`);
}

/* ── MONOTONIC ─────────────────────────────────────────────────────── */
for (const k of ['ids', 'urls', 'images']) {
  const have = new Set(now.monotonic[k]);
  const gone = base.monotonic[k].filter((x) => !have.has(x));
  expect(!gone.length, 'monotonic', `${gone.length} baseline ${k} disappeared:\n      ${gone.join('\n      ')}`);
}

/* ── VOICE ─────────────────────────────────────────────────────────────
   Visitor-facing text, per CLAUDE.md: page copy (scripts, styles and
   comments stripped), alt/title/aria-label/data-cap attributes, head
   meta, JSON-LD strings, and the strings in index.html's DATA arrays.
   CSS custom properties and code never reach this text. Exempt: the
   `--:--:--` clock placeholder and CLI flags such as `--check`. */
const ROLE = new RegExp('\\bassoc' + 'iates?\\b', 'i');   // the role word CLAUDE.md forbids, never spelled out
const VISIBLE_ATTRS = ['alt', 'title', 'aria-label', 'aria-description', 'placeholder', 'data-cap'];
const dataBlock = (() => {
  const src = raw['index.html'];
  const a = src.indexOf('DATA /'), b = src.indexOf('ENGINE /');
  if (a === -1 || b === -1 || b < a) return null;
  return src.slice(src.indexOf('*/', a) + 2, src.lastIndexOf('/*', b));
})();
expect(dataBlock !== null, 'voice', 'index.html: could not find the DATA / ... ENGINE / block to read its strings');

for (const f of PAGES) {
  const m = raw[f].match(ROLE);
  expect(!m, 'voice', `${f}: contains the forbidden role word ("${m && raw[f].slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' ')}")`);

  const body = (dom[f].match(/<body\b[^>]*>([\s\S]*)<\/body>/i) || [, dom[f]])[1];
  const sources = [['copy', reading(body)]];
  for (const { tag, a } of openTags(body)) {
    for (const k of VISIBLE_ATTRS) if (a[k]) sources.push([`<${tag} ${k}>`, a[k]]);
  }
  for (const [k, v] of Object.entries(now.pages[f].meta)) [].concat(v).forEach((x) => sources.push([`head ${k}`, x]));
  walk(ld[f], (v, k) => sources.push([`JSON-LD ${k}`, v]));
  if (f === 'index.html' && dataBlock) jsStrings(dataBlock).forEach((v) => sources.push(['DATA string', v]));

  for (const [where, s] of sources) {
    const em = s.indexOf('\u2014');
    expect(em === -1, 'voice', `${f} ${where}: em dash in "…${s.slice(Math.max(0, em - 30), em + 30)}…"`);
    const t = s.split(CLOCK).join(' ');
    for (const d of t.matchAll(/--/g)) {
      const flag = /^--[a-z]/.test(t.slice(d.index, d.index + 3)) && /(^|[\s(`'"])$/.test(t.slice(Math.max(0, d.index - 1), d.index));
      expect(flag, 'voice', `${f} ${where}: "--" in "…${t.slice(Math.max(0, d.index - 30), d.index + 30)}…"`);
    }
  }
}

/* ── report ────────────────────────────────────────────────────────── */
if (fails.length) {
  const groups = ['fixed', 'bio', 'derived', 'monotonic', 'voice'];
  console.error(`\n  ✗ entity check FAILED: ${fails.length} of ${checks} assertions\n`);
  for (const g of groups) {
    const mine = fails.filter(([k]) => k === g);
    if (!mine.length) continue;
    console.error(`  [${g}]`);
    mine.forEach(([, msg]) => console.error(`    · ${msg}`));
  }
  console.error('\n    Fix the page, or if the change is deliberate, re-capture with\n' +
                '    node tools/check-entity.mjs --write-baseline and review the baseline diff.\n');
  process.exit(1);
}
console.log(`\n  ✓ entity check passed: ${checks} assertions (bio in ${base.bioLocations.length + 3} places, ` +
            `${base.monotonic.ids.length} @ids, ${base.monotonic.urls.length} URLs, ${base.monotonic.images.length} images held).\n`);
