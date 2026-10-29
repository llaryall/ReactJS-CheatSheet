// A few English whenToUse/whenNotToUse blocks kept Persian numeral prefixes
// (۱. ۲. ۳.) from the pattern they were translated out of. The prose is already
// English; normalize the numbering so the fields are uniformly English.
const { Client } = require('pg');

const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
  throw new Error('DATABASE_URI is required. Load it with: node --env-file=.env.local <script>');
}

const DIGITS = { '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9' };

const normalize = (value) =>
  String(value).replace(/[۰-۹]/g, (d) => DIGITS[d]);

(async () => {
  const c = new Client({ connectionString: DATABASE_URI });
  await c.connect();

  const rows = (await c.query(
    `SELECT l.id, t.slug, l.when_to_use, l.when_not_to_use
     FROM topics_locales l JOIN topics t ON t.id = l._parent_id
     WHERE l._locale = 'en' ORDER BY t.slug`,
  )).rows;

  const changed = [];
  for (const r of rows) {
    const w2u = normalize(r.when_to_use || '');
    const w2nu = normalize(r.when_not_to_use || '');
    if (w2u === r.when_to_use && w2nu === r.when_not_to_use) continue;

    await c.query(
      'UPDATE topics_locales SET when_to_use = $1, when_not_to_use = $2 WHERE id = $3',
      [w2u, w2nu, r.id],
    );
    changed.push(r.slug);
  }

  await c.end();
  console.log(`normalized numbering in ${changed.length} topics`);
  if (changed.length) console.log('  ' + changed.join('\n  '));
})().catch((e) => { console.error(e.message); process.exit(1); });
