#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   build-gallery.mjs / regenerate gallery.html + sitemap.xml from
   index.html's EVENTS array

   Every event photo on the site is declared exactly once, in EVENTS.
   Three surfaces render from it in the browser (the events grid, the
   contact sheet, the lightbox) and two are static files that crawlers
   read without running any JavaScript:

     gallery.html   the photo archive: EVERY pic, newest first
     sitemap.xml    the <image:image> block under the gallery URL

   This script writes those two. It is the reason the archive can be the
   most complete surface on the site without anyone maintaining a second
   list by hand.

   Usage:
     node tools/build-gallery.mjs           rewrite both files
     node tools/build-gallery.mjs --check   exit 1 if either has drifted

   No dependencies, no npm, no bundler. A maintenance script you run by
   hand, NOT a build step; the site still deploys as plain static files.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readArray, dkey, esc, isoDate, jpegSize, splice, die } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');
const GALLERY = join(ROOT, 'gallery.html');
const SITEMAP = join(ROOT, 'sitemap.xml');
const SITE = 'https://danieluusitalo.com';
const PERSON = `${SITE}/#person`;

/* Photos that legitimately live outside EVENTS: portraits and the social
   card. They are press-kit material, not event documentation, so they do
   not belong in the archive. Anything else unreferenced is a mistake. */
const NON_EVENT = ['portrait.jpg', 'portrait-bw.jpg'];

const COUNTRY = {
  AL: 'Albania', CH: 'Switzerland', DE: 'Germany', FI: 'Finland', HR: 'Croatia',
  IT: 'Italy', NL: 'Netherlands', SE: 'Sweden', UK: 'United Kingdom',
};

/* "DAVOS, CH" -> "Davos, Switzerland" · "ONLINE" -> "Online" */
function place(city) {
  return city.split(',').map((part, i) => {
    const t = part.trim();
    if (i === 1) {
      if (!COUNTRY[t]) die(`Unknown country code "${t}". Add it to COUNTRY in this script.`);
      return COUNTRY[t];
    }
    return t.replace(/\S+/g, (w) => w[0] + w.slice(1).toLowerCase());
  }).join(', ');
}

/* "INVESTOR JURY" -> "Investor Jury" · "CO-HOST" -> "Co-Host" */
const titleCase = (s) => s.toLowerCase().replace(/(^|[\s-])(\S)/g, (m) => m.toUpperCase());

/* ── read + validate ───────────────────────────────────────────────── */
const EVENTS = readArray(SRC, 'EVENTS');

const slugs = new Set();
const referenced = new Set();
EVENTS.forEach((e, i) => {
  const who = `entry ${i} ("${e.name || '?'}")`;
  for (const f of ['k', 'd', 'city', 'name', 'role', 'slug']) {
    if (!e[f]) die(`EVENTS ${who} is missing \`${f}\`.`);
  }
  if (dkey(e.k) < 0) {
    die(`EVENTS ${who} has a malformed sort key "${e.k}".\n` +
        `    Use "YYYY.MM" (e.g. 2026.09), or "YYYY" if the month is unknown.`);
  }
  if (!/^[a-z0-9-]+$/.test(e.slug)) die(`EVENTS ${who} has a non-URL-safe slug "${e.slug}".`);
  if (slugs.has(e.slug)) die(`EVENTS ${who} reuses the slug "${e.slug}". Slugs are public URLs.`);
  slugs.add(e.slug);
  if (!e.pics || !e.pics.length) die(`EVENTS ${who} has no \`pics\`.`);
  e.pics.forEach((p, n) => {
    if (!p.src) die(`EVENTS ${who} pic ${n} is missing \`src\`.`);
    if (!p.alt) die(`EVENTS ${who} pic ${n} ("${p.src}") is missing \`alt\`.`);
    if (p.alt.trim().split(/\s+/).length < 5) {
      die(`EVENTS ${who} pic ${n} has a stub alt: "${p.alt}".\n` +
          `    Describe what is visible in the frame, not just the event name.`);
    }
    try { statSync(join(ROOT, p.src)); }
    catch { die(`EVENTS ${who} pic ${n} points at a file that does not exist: ${p.src}`); }
    if (referenced.has(p.src)) die(`${p.src} is listed twice in EVENTS.`);
    referenced.add(p.src);
  });
});

/* No orphans. An unreferenced photo is either a forgotten entry or dead
   weight in a public repo; both are worth failing over. */
const orphans = readdirSync(join(ROOT, 'photos'))
  .filter((f) => /\.jpe?g$/i.test(f))
  .filter((f) => !referenced.has(`photos/${f}`) && !NON_EVENT.includes(f));
if (orphans.length) {
  die(`These files in photos/ are referenced by nothing:\n` +
      orphans.map((f) => `      ${f}`).join('\n') + '\n' +
      `    Add them to a pics[] in EVENTS, list them in NON_EVENT, or delete them.`);
}

/* Ordering authority, mirroring EVENTS_SORTED + ARCHIVE in index.html. */
const sorted = [...EVENTS].sort((a, b) => dkey(b.k) - dkey(a.k));
const archive = sorted.filter((e) => !e.archived).flatMap((e) =>
  e.pics.map((p, n) => ({
    ...p,
    ev: e,
    id: n === 0 ? e.slug : `${e.slug}-${n + 1}`,
    ...jpegSize(join(ROOT, p.src)),
  })));

/* ── gallery.html ──────────────────────────────────────────────────── */
const figure = (p) => {
  const e = p.ev;
  const note = p.note || titleCase(e.role);
  const label = e.url
    ? `<a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(e.name)}</a>`
    : esc(e.name);
  /* The grid is 3:2, so portrait frames get cropped hard. `pos` is the
     same object-position the homepage card uses; a pic-level `pos` wins
     over the event's. */
  const pos = p.pos || e.pos;
  const style = pos ? ` style="object-position:${esc(pos)}"` : '';
  return `    <figure id="${p.id}">
      <img src="${esc(p.src)}" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}" loading="lazy" decoding="async"${style}>
      <figcaption><b>${label}</b><time datetime="${isoDate(e.k)}">${titleCase(e.d)}</time> &middot; ${esc(place(e.city))} &middot; ${esc(note)}</figcaption>
    </figure>`;
};

const years = archive.map((p) => p.ev.k.slice(0, 4));
const span = `${Math.min(...years)} to ${Math.max(...years)}`;
const eventCount = new Set(archive.map((p) => p.ev.slug)).size;
const stat = `  <p class="stat">${archive.length} photographs &middot; ${eventCount} events &middot; ` +
             `${span} &middot; newest first</p>`;

/* One ImageObject per visible figure, so a crawler that never runs the
   homepage's JavaScript still gets every photo with its caption, its
   dimensions and the place it was taken.

   No datePublished: half these events are month-precision only and
   schema.org Date wants YYYY-MM-DD, so emitting it would mean inventing
   a day. The visible <time datetime="YYYY-MM"> carries the date instead,
   which is valid HTML and does not have to lie. */
const graph = [
  {
    '@type': 'ImageGallery',
    '@id': `${SITE}/gallery.html#webpage`,
    url: `${SITE}/gallery.html`,
    name: 'Photo archive / Daniel Uusitalo',
    description: 'Photographs of Daniel Uusitalo speaking, hosting and judging at ' +
                 'startup and climate events across Europe.',
    inLanguage: 'en',
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': PERSON },
    numberOfItems: archive.length,
    associatedMedia: archive.map((p) => ({ '@id': `${SITE}/${p.src}` })),
  },
  /* Every ImageObject below points `about` at #person, an @id defined on
     the homepage. Cross-page @id references are valid JSON-LD, but a
     validator handed this page alone would see 24 dangling ones, so the
     node is restated here. Thin on purpose: the homepage owns the full
     description, and two copies of it would be two things to keep in
     sync. Same shape writing.html uses. */
  {
    '@type': 'Person',
    '@id': PERSON,
    name: 'Daniel Uusitalo',
    url: `${SITE}/`,
  },
  ...archive.map((p) => ({
    '@type': 'ImageObject',
    '@id': `${SITE}/${p.src}`,
    contentUrl: `${SITE}/${p.src}`,
    url: `${SITE}/gallery.html#${p.id}`,
    caption: p.alt,
    width: p.w,
    height: p.h,
    ...(p.ev.city === 'ONLINE'
      ? {}
      : { contentLocation: { '@type': 'Place', name: place(p.ev.city) } }),
    about: { '@id': PERSON },
  })),
];
const schema = '<script type="application/ld+json">\n' +
  JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2) +
  '\n</script>';

/* ── sitemap.xml ───────────────────────────────────────────────────── */
const images = archive.map((p) =>
  `    <image:image>\n` +
  `      <image:loc>${SITE}/${p.src}</image:loc>\n` +
  `      <image:caption>${esc(p.alt)}</image:caption>\n` +
  `    </image:image>`).join('\n');

/* ── write ─────────────────────────────────────────────────────────── */
let html = readFileSync(GALLERY, 'utf8');
html = splice(html, 'SCHEMA', schema, 'gallery.html');
html = splice(html, 'STAT', stat, 'gallery.html');
html = splice(html, 'GRID', archive.map(figure).join('\n'), 'gallery.html');

let xml = readFileSync(SITEMAP, 'utf8');
xml = splice(xml, 'IMAGES', images, 'sitemap.xml');

const check = process.argv.includes('--check');
const files = [[GALLERY, html, 'gallery.html'], [SITEMAP, xml, 'sitemap.xml']];
const stale = files.filter(([f, next]) => readFileSync(f, 'utf8') !== next);

if (check) {
  if (stale.length) {
    die(`${stale.map(([, , n]) => n).join(' and ')} OUT OF SYNC with the EVENTS array.\n` +
        '    Run: node tools/build-gallery.mjs');
  }
  console.log(`\n  ✓ gallery.html and sitemap.xml are in sync ` +
              `(${archive.length} photos across ${eventCount} events).\n`);
} else if (!stale.length) {
  console.log(`\n  = gallery.html and sitemap.xml already up to date (${archive.length} photos).\n`);
} else {
  stale.forEach(([f, next]) => writeFileSync(f, next));
  console.log(`\n  ✓ regenerated ${stale.map(([, , n]) => n).join(' + ')}: ` +
              `${archive.length} photos across ${eventCount} events, ${span}.\n` +
              `    Every figure, schema node and sitemap entry maps 1:1 to a pic in EVENTS.\n`);
}
