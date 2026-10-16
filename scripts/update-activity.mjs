/** Node 24+. No dependencies. Keep good artwork when GitHub is unavailable. */
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const username = process.env.PROFILE_USERNAME || 'niamatmarjan';
if (!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(username)) throw Error('Invalid GitHub username');
const root = fileURLToPath(new URL('../', import.meta.url));
const token = process.env.GITHUB_TOKEN;
const xml = value => String(value).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
const number = value => new Intl.NumberFormat('en-US').format(value);

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    signal: AbortSignal.timeout(30_000),
    headers: { 'User-Agent': `${username}-profile-readme`, ...options.headers },
  });
  if (!response.ok) throw Error(`GitHub request failed (${response.status}): ${new URL(url).pathname}`);
  return response;
}

async function getCalendar() {
  if (token) {
    const response = await request('https://api.github.com/graphql', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionLevel}}}}}}',
        variables: { login: username },
      }),
    });
    const body = await response.json();
    if (body.errors?.length || !body.data?.user) throw Error('GitHub contribution query failed');
    const calendar = body.data.user.contributionsCollection.contributionCalendar;
    const levels = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
    return {
      total: calendar.totalContributions,
      days: calendar.weeks.flatMap(week => week.contributionDays.map(day => ({ date: day.date, level: levels[day.contributionLevel] }))),
    };
  }
  // Local bootstrap uses only the public profile; no private credentials needed.
  const html = await (await request(`https://github.com/users/${username}/contributions`)).text();
  const total = html.match(/([\d,]+)\s+contributions?\s+in the last year/i);
  const days = [...html.matchAll(/<td\b[^>]*\bdata-date="(\d{4}-\d{2}-\d{2})"[^>]*\bdata-level="([0-4])"[^>]*>/g)]
    .map(match => ({ date: match[1], level: Number(match[2]) }))
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!total || days.length < 350) throw Error('Public calendar format changed; retained existing assets');
  return { total: Number(total[1].replaceAll(',', '')), days };
}

const [profile, calendar] = await Promise.all([
  request(`https://api.github.com/users/${username}`, { headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }).then(response => response.json()),
  getCalendar(),
]);
if (!Number.isSafeInteger(calendar.total) || calendar.total < 0 || calendar.days.length < 350 || calendar.days.length > 380) throw Error('Invalid contribution data');
if (!Number.isSafeInteger(profile.public_repos) || !Number.isSafeInteger(profile.followers)) throw Error('Invalid profile data');
calendar.days.sort((a, b) => a.date.localeCompare(b.date));
const uniqueDates = new Set();
for (const day of calendar.days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day.date) || !Number.isInteger(day.level) || day.level < 0 || day.level > 4 || uniqueDates.has(day.date)) throw Error('Invalid calendar day');
  uniqueDates.add(day.date);
}
const updated = new Date().toLocaleDateString('en-GB', { timeZone: 'Asia/Colombo', year: 'numeric', month: 'short', day: '2-digit' });
const start = new Date(`${calendar.days[0].date}T00:00:00Z`);
const startWeek = start.getTime() - start.getUTCDay() * 86_400_000;

function draw(dark, mobile) {
  const width = mobile ? 520 : 1080;
  const height = mobile ? 390 : 382;
  const padding = mobile ? 28 : 40;
  const colors = dark
    ? { bg: '#1e1614', text: '#edefea', muted: '#c4b6ac', rule: '#4f3730', accent: '#ffc20e', levels: ['#382823', '#704338', '#a8583e', '#da8846', '#ffc20e'] }
    : { bg: '#edefea', text: '#321e19', muted: '#69564e', rule: '#c9beb2', accent: '#7a1712', levels: ['#d9d7cc', '#d8b7a0', '#bb795b', '#95432f', '#7a1712'] };
  const text = (x, y, value, size = 15, fill = colors.text, weight = 400, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${xml(value)}</text>`;
  const stats = [[number(calendar.total), 'contributions / past year'], [number(profile.public_repos), 'public repositories'], [number(profile.followers), 'followers']];
  let contents = `<rect width="${width}" height="${height}" fill="${colors.bg}"/>`;
  contents += text(padding, mobile ? 52 : 55, 'THE WORK CONTINUES.', mobile ? 25 : 30, colors.text, 800);
  contents += text(mobile ? padding : width - padding, mobile ? 79 : 53, `@${username}`, 14, colors.muted, 400, mobile ? '' : 'text-anchor="end"');
  contents += `<path d="M${padding} ${mobile ? 99 : 78}H${width - padding}" stroke="${colors.rule}"/>`;
  stats.forEach(([value, label], index) => {
    const x = padding + index * (width - 2 * padding) / 3;
    contents += text(x, mobile ? 151 : 136, value, mobile ? 35 : 42, colors.accent, 700);
    if (mobile) {
      const words = index === 0 ? ['contributions', 'past year'] : index === 1 ? ['public', 'repositories'] : ['followers', ''];
      contents += text(x, 176, words[0], 12, colors.muted) + text(x, 193, words[1], 12, colors.muted);
    } else contents += text(x, 161, label, 14, colors.muted);
  });
  const last = new Date(`${calendar.days.at(-1).date}T00:00:00Z`);
  const columns = Math.floor((last.getTime() - startWeek) / (7 * 86_400_000)) + 1;
  const gridY = mobile ? 245 : 216;
  const pitch = (width - 2 * padding) / columns;
  const box = Math.min(pitch - 3, mobile ? 6 : 11);
  let previousMonth = -1;
  for (const day of calendar.days) {
    const date = new Date(`${day.date}T00:00:00Z`);
    const column = Math.floor((date.getTime() - startWeek) / (7 * 86_400_000));
    const x = padding + column * pitch;
    const y = gridY + date.getUTCDay() * (box + 3);
    contents += `<rect x="${x.toFixed(2)}" y="${y}" width="${box}" height="${box}" rx="1" fill="${colors.levels[day.level]}"><title>${day.date}: contribution intensity ${day.level} of 4</title></rect>`;
    if (date.getUTCMonth() !== previousMonth) {
      if (!mobile || column % 2 === 0) contents += text(x, gridY - 13, date.toLocaleDateString('en', { month: 'short', timeZone: 'UTC' }), mobile ? 10 : 11, colors.muted);
      previousMonth = date.getUTCMonth();
    }
  }
  // One sweep on load; the real calendar remains visible in reduced-motion mode.
  contents += `<rect class="signal" x="${padding}" y="${gridY - 2}" width="2" height="${7 * (box + 3)}" fill="${colors.accent}" opacity="0"/>`;
  const legendY = mobile ? 329 : 331;
  contents += text(width - padding - 116, legendY + 8, 'Less', 10, colors.muted);
  colors.levels.forEach((fill, i) => { contents += `<rect x="${width - padding - 88 + i * 11}" y="${legendY}" width="8" height="8" rx="1" fill="${fill}"/>`; });
  contents += text(width - padding, legendY + 8, 'More', 10, colors.muted, 400, 'text-anchor="end"');
  contents += text(padding, height - 17, `Updated ${updated} · GitHub contribution calendar`, mobile ? 11 : 12, colors.muted);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${xml(username)} — GitHub activity</title><desc id="desc">${calendar.total} contributions in the last year, ${profile.public_repos} public repositories, ${profile.followers} followers. Updated ${updated}. Calendar colors show daily contribution intensity.</desc><style>text{font-family:Arial,Helvetica,sans-serif}.signal{animation:scan 4s ease-in-out 1}@keyframes scan{0%{opacity:0;transform:translateX(0)}10%{opacity:.8}90%{opacity:.8}100%{opacity:0;transform:translateX(${width - 2 * padding}px)}}@media(prefers-reduced-motion:reduce){.signal{animation:none}}</style>${contents}</svg>\n`;
}

await mkdir(`${root}/assets`, { recursive: true });
const outputs = [];
for (const dark of [false, true]) for (const mobile of [false, true]) {
  outputs.push([`activity${mobile ? '-mobile' : ''}-${dark ? 'dark' : 'light'}.svg`, draw(dark, mobile)]);
}
// Fetch and render every variant before replacing any published artwork.
for (const [name, content] of outputs) await writeFile(`${root}/assets/${name}.tmp`, content);
for (const [name] of outputs) await rename(`${root}/assets/${name}.tmp`, `${root}/assets/${name}`);
console.log(`Updated ${outputs.length} assets for ${username}: ${calendar.total} contributions, ${profile.public_repos} repositories, ${profile.followers} followers.`);
