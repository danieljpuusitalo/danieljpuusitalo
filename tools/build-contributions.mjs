#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════════
   build-contributions.mjs / snapshot the real GitHub contribution
   calendar into #gh-card inside index.html

   Why this exists
   ───────────────
   The card used to draw a 52-week grid from
   /users/:u/events/public. That endpoint is not a commit history. It
   is a truncated activity feed: three pages is 300 records, GitHub
   caps it well below that, and in practice it returned 47 events
   covering 26 days. The other ~46 columns were therefore blank by
   construction, not because nothing was committed in them. It also
   counted *events* (pushes, stars, forks) rather than commits, and
   omitted private repositories entirely.

   Audited 2026-09-19: the true 12-month figure is an order of
   magnitude larger than what the card was drawing. A heatmap that
   reads "he started a month ago" when the opposite is true is worse
   than no heatmap.

   The honest source is the calendar fragment GitHub serves at
   github.com/users/:u/contributions — exact per-day counts, public
   and private, no token required. It sends no CORS header, so a
   browser cannot fetch it. Hence: fetch it here, at the desk, and
   splice the numbers into the page as static HTML. That also puts the
   card in front of crawlers that do not run JavaScript, which the
   client-rendered version never was.

   Two things this deliberately does NOT do
   ────────────────────────────────────────
   1. Reach back further than 12 months. The fragment windows to one
      year, and full-year fetches for 2023, 2024 and 2025 each return
      zero active days: the account's first public repository was
      created 2026-02-17. There is no earlier history to recover, so
      there is no wider grid worth drawing.
   2. Invent the intensity buckets. data-l comes straight from
      GitHub's own data-level attribute; `cuts` is read back out of
      that assignment rather than guessed, so the shading matches
      github.com/:u exactly.

   Usage:
     node tools/build-contributions.mjs           re-snapshot index.html
     node tools/build-contributions.mjs --check   exit 1 if missing/stale

   --check differs from the other generators on purpose. Theirs compare
   two files and can demand byte equality. This one's input is a live
   third-party page that changes every time Daniel commits, so byte
   equality would fail every day and teach you to ignore it. It
   validates structure and age instead, and only the re-snapshot path
   touches the network.

   No dependencies. A maintenance script you run by hand, NOT a build
   step; the site still deploys as plain static files.
   ═══════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { esc, splice, die } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'index.html');

const USER = 'danieljpuusitalo';
const STALE_DAYS = 90;

const check = process.argv.includes('--check');
const html = readFileSync(SRC, 'utf8');

/* ── --check: structural, offline ──────────────────────────────────
   Proves the block is present, parses, and is not months old. It
   cannot prove the counts are current; nothing offline can. */
if (check) {
  const m = html.match(/<!-- GEN:CONTRIB -->([\s\S]*?)<!-- \/GEN:CONTRIB -->/);
  if (!m) die('Missing <!-- GEN:CONTRIB --> … <!-- /GEN:CONTRIB --> markers in index.html.');
  const body = m[1];

  const snap = body.match(/data-snapshot="(\d{4}-\d{2}-\d{2})"/);
  if (!snap) die('The contributions card has no data-snapshot date.\n' +
                 '    Run: node tools/build-contributions.mjs');

  const cells = (body.match(/class="gh-cell"/g) || []).length;
  const cols = (body.match(/class="gh-col"/g) || []).length;
  if (cols < 52 || cells !== cols * 7) {
    die(`The contributions grid is malformed: ${cols} columns, ${cells} cells ` +
        `(expected 7 per column, 52+ columns).\n` +
        '    Run: node tools/build-contributions.mjs');
  }

  const age = Math.floor((Date.now() - Date.parse(snap[1] + 'T00:00:00Z')) / 86400000);
  if (age > STALE_DAYS) {
    die(`The contributions snapshot is ${age} days old (taken ${snap[1]}).\n` +
        '    Run: node tools/build-contributions.mjs');
  }
  console.log(`\n  ✓ contributions card is well formed ` +
              `(${cols} weeks, snapshot ${snap[1]}, ${age} day${age === 1 ? '' : 's'} old).\n`);
  process.exit(0);
}

/* ── fetch ─────────────────────────────────────────────────────────
   Two unauthenticated GETs. The calendar fragment carries the counts;
   the API call carries the avatar, display name and public repo total
   that used to be fetched in the browser on every page load. */
const get = async (url, as) => {
  const headers = { 'User-Agent': `${USER}-site-tools` };
  /* Anonymous api.github.com is 60 requests an hour *per IP*, and this
     script spends five of them per repo. On a laptop that is invisible.
     On a shared CI runner the IP is not ours and the budget may already
     be gone, so use a token when one is in the environment. The calendar
     fragment is not part of the API and needs no auth either way. */
  if (process.env.GITHUB_TOKEN && url.startsWith('https://api.github.com/')) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const r = await fetch(url, { headers });
  if (!r.ok) {
    const limited = r.status === 403 && r.headers.get('x-ratelimit-remaining') === '0';
    die(`${url} returned ${r.status} ${r.statusText}.` +
        (limited ? '\n    That is the rate limit, not a broken URL. Set GITHUB_TOKEN and retry.' : ''));
  }
  return as === 'json' ? r.json() : r.text();
};

const [frag, profile] = await Promise.all([
  get(`https://github.com/users/${USER}/contributions`, 'text'),
  get(`https://api.github.com/users/${USER}`, 'json'),
]);

/* ── parse the calendar fragment ───────────────────────────────────
   Each day is a <td data-date data-level>; the count lives in a
   sibling <tool-tip for="<td id>">. Pair them by id rather than by
   document order, which GitHub has reshuffled before. */
const tips = {};
for (const m of frag.matchAll(/<tool-tip[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
  tips[m[1]] = m[2];
}

const days = [];
for (const m of frag.matchAll(
  /<td\b[^>]*?\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*?\bid="([^"]+)"[^>]*?\bdata-level="(\d)"[^>]*?>/g
)) {
  const [, date, id, level] = m;
  const tip = (tips[id] || '').trim();
  if (!tip) die(`No tooltip found for ${date} (id ${id}) — GitHub changed the markup.`);
  const n = /^No contributions/i.test(tip) ? 0 : parseInt(tip, 10);
  if (!Number.isFinite(n)) die(`Could not read a count out of "${tip}" for ${date}.`);
  days.push({ date, n, l: +level });
}

if (days.length < 365) die(`Only parsed ${days.length} days out of the calendar fragment. ` +
                           'GitHub changed the markup; fix the regex rather than shipping a short grid.');

/* Sort into date order. The fragment is a table of seven <tr>, one per
   weekday, each holding 53 <td> — so document order is row-major: every
   Sunday, then every Monday, and so on. Slicing that into sevens builds
   a column out of seven consecutive Sundays, which is what the first
   cut of this script shipped. Sorting makes each slice below a real
   Sunday-to-Saturday week. */
days.sort((a, b) => (a.date < b.date ? -1 : 1));

/* And prove it: a calendar with a hole in it would still sort cleanly
   and still render, just silently shifted by a day from the gap on. */
for (let i = 1; i < days.length; i++) {
  const expected = new Date(Date.parse(days[i - 1].date + 'T00:00:00Z') + 86400000)
    .toISOString().slice(0, 10);
  if (days[i].date !== expected) {
    die(`The calendar skips from ${days[i - 1].date} to ${days[i].date}. ` +
        'Every column after the gap would be shifted; not writing a skewed grid.');
  }
}

/* Headline total is GitHub's own arithmetic. If our sum disagrees we
   have dropped or double-counted days, and the card would understate
   him in exactly the way this script exists to stop. */
const sum = days.reduce((a, d) => a + d.n, 0);
const head = frag.match(/([\d,]+)\s+contributions?\s+in/);
if (head) {
  const stated = +head[1].replace(/,/g, '');
  if (stated !== sum) die(`Parsed ${sum} contributions but the page says ${stated}. Not writing a wrong number.`);
}

const first = days[0], last = days[days.length - 1];
if (new Date(first.date + 'T00:00:00Z').getUTCDay() !== 0) {
  die(`The grid does not start on a Sunday (${first.date}); the column layout would be skewed.`);
}

/* Read GitHub's bucket boundaries back out of its own level
   assignment: the lowest count it filed under each level. Needed
   below to re-shade any day the reconciliation raises, and it is also
   the check that would catch GitHub silently changing its quartiles. */
const cuts = [1, 2, 3, 4]
  .map((l) => {
    const c = days.filter((d) => d.l === l).map((d) => d.n);
    return c.length ? Math.min(...c) : null;
  })
  .filter((c) => c !== null);

/* ── reconcile against the commits API ─────────────────────────────
   The calendar is a cached aggregate and it lags. When Daniel added
   daniel@4impact.vc to his account on 2026-09-19, all 82 commits
   under that address were re-attributed to him at the API layer
   within the hour, while the calendar still showed eight days short
   — 2026-09-18 read zero despite three pushed commits. Every short
   day was 100% daniel@4impact.vc. Nothing was broken; the aggregate
   simply had not been rebuilt, and there is no way to make it rebuild
   from outside.

   So: take the higher of the two per day. This can only ever raise a
   day to the number of commits that provably exist on it, each one
   nameable by SHA — it never invents a contribution. Private repos
   still come from the calendar, which is the only source for them.
   Once GitHub catches up the two converge and this becomes a no-op,
   which is why it stays in permanently rather than being a one-off
   patch. */
const api = async (path) => get(`https://api.github.com/${path}`, 'json');

const repos = (await api(`users/${USER}/repos?per_page=100&type=owner`))
  .filter((r) => !r.fork);   /* forks never count toward the graph */

const pub = {};
let pubTotal = 0;
for (const r of repos) {
  for (let page = 1; page <= 5; page++) {
    /* Default branch only — GitHub does not count commits made on any
       other branch, so neither may we. */
    const batch = await api(
      `repos/${USER}/${r.name}/commits?sha=${encodeURIComponent(r.default_branch)}&per_page=100&page=${page}`
    );
    if (!batch.length) break;
    for (const c of batch) {
      /* author is the resolved GitHub account, not the raw git
         trailer. Null means the authoring email is still unlinked, in
         which case GitHub will not count it and neither do we. */
      if (!c.author || c.author.login !== USER) continue;
      const d = c.commit.author.date.slice(0, 10);
      pub[d] = (pub[d] || 0) + 1;
      pubTotal++;
    }
    if (batch.length < 100) break;
  }
}

const level = (n) => cuts.filter((c) => n >= c).length;

let raisedDays = 0, raisedBy = 0;
for (const d of days) {
  const p = pub[d.date] || 0;
  if (p > d.n) {
    raisedDays++;
    raisedBy += p - d.n;
    d.n = p;
    d.l = level(p);
    d.fromApi = true;
  }
}

const sumFinal = days.reduce((a, d) => a + d.n, 0);
const active = days.filter((d) => d.n > 0).length;

/* ── render ────────────────────────────────────────────────────────
   Week-major columns, Sunday-first rows, matching the fragment's own
   ordering. A trailing partial week is padded with level-less cells
   so the last column keeps its height. */
const cells = days.map((d) => {
  const label = `${d.date} · ${d.n} contribution${d.n === 1 ? '' : 's'}`;
  return `<div class="gh-cell" data-l="${d.l}" title="${esc(label)}"></div>`;
});
while (cells.length % 7) cells.push('<div class="gh-cell"></div>');

const cols = [];
for (let i = 0; i < cells.length; i += 7) {
  cols.push(`<div class="gh-col">${cells.slice(i, i + 7).join('')}</div>`);
}

const name = profile.name || profile.login;
const today = new Date().toISOString().slice(0, 10);

/* The count line is the whole point of the card, so it states the
   real figure in words rather than leaving the reader to infer it
   from the squares. */
const mkBody = (snapshot) =>
  `      <div class="gh-left">\n` +
  `        <img class="gh-avatar" src="${esc(profile.avatar_url)}" alt="${esc(profile.login)}" ` +
  `width="96" height="96" loading="lazy">\n` +
  `        <div>\n` +
  `          <div class="gh-user">${esc(name)}</div>\n` +
  `          <a class="gh-link" href="https://github.com/${esc(profile.login)}" target="_blank" rel="noopener">` +
  `@${esc(profile.login)} &#8599;</a>\n` +
  `          <div class="gh-repos">${profile.public_repos} public repos</div>\n` +
  `        </div>\n` +
  `      </div>\n` +
  `      <div class="gh-graph" data-snapshot="${snapshot}">\n` +
  `        <div class="gh-heatmap">${cols.join('')}</div>\n` +
  `        <div class="gh-count">${sumFinal.toLocaleString('en-US')} contributions, ` +
  `${active} active days, ${first.date} to ${last.date}</div>\n` +
  `      </div>`;

const next = splice(html, 'CONTRIB', mkBody(today), 'index.html');

/* ── don't churn the file for a date bump ──────────────────────────
   Once this runs on a schedule, the snapshot date is the one thing
   that differs on every single run. Rewriting for that alone would put
   a commit in the log every day that says nothing happened, on a repo
   whose history is meant to be readable. So: if re-rendering with the
   *existing* snapshot date reproduces the file byte for byte, the
   contribution data has not moved.

   Refresh anyway once a week, because the date is not decoration — it
   is what --check measures staleness against, and letting it drift
   would slowly turn a healthy card into a failing one. */
const REFRESH_DAYS = 7;
const prevSnap = (html.match(/<!-- GEN:CONTRIB -->[\s\S]*?data-snapshot="(\d{4}-\d{2}-\d{2})"/) || [])[1];
const dataUnchanged = prevSnap && splice(html, 'CONTRIB', mkBody(prevSnap), 'index.html') === html;
const prevAge = prevSnap
  ? Math.floor((Date.parse(today) - Date.parse(prevSnap)) / 86400000)
  : Infinity;

const recon = raisedDays
  ? `    Reconciled against the commits API: ${raisedDays} day${raisedDays === 1 ? '' : 's'} raised, ` +
    `+${raisedBy} contribution${raisedBy === 1 ? '' : 's'} the cached calendar had not picked up.\n` +
    `    Calendar said ${sum}; ${pubTotal} attributed public commits across ` +
    `${repos.length} non-fork repos say otherwise. Every added unit is a real commit with a SHA.\n`
  : `    Calendar and commits API agree — nothing to reconcile.\n`;

if (html === next || (dataUnchanged && prevAge < REFRESH_DAYS)) {
  console.log(`\n  = contributions card already up to date ` +
              `(${sumFinal} contributions, ${active} active days).\n` +
              (dataUnchanged && prevAge > 0
                ? `    Nothing new since ${prevSnap}; leaving the file alone rather than ` +
                  `bumping the date for its own sake.\n`
                : '') +
              recon);
} else {
  writeFileSync(SRC, next);
  console.log(`\n  ✓ snapshotted the GitHub contribution calendar into index.html.\n` +
              `    ${sumFinal} contributions over ${cols.length} weeks, ${active} active days, ` +
              `${first.date} to ${last.date}.\n` +
              recon +
              `    Intensity buckets start at ${cuts.join(' / ')} — GitHub's own, not invented here.\n` +
              `    Snapshot dated ${today}; re-run whenever it drifts out of date.\n`);
}
