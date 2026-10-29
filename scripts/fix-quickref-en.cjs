// topics.quick_ref_* are NOT localized columns, so both locales share them.
// Every English code_snippet_* already reads correctly, so rebuild the quick
// reference from it: same code, English comments, plus a usage note.
const { Client } = require('pg');

const DATABASE_URI = process.env.DATABASE_URI;
if (!DATABASE_URI) {
  throw new Error('DATABASE_URI is required. Load it with: node --env-file=.env.local <script>');
}

const PERSIAN = /[؀-ۿ]/u;

function buildQuickRef(snippet) {
  if (!snippet) return null;
  const cleaned = String(snippet).replace(/[ \t]+$/gm, '').trim();
  return cleaned;
}

(async () => {
  const c = new Client({ connectionString: DATABASE_URI });
  await c.connect();

  const rows = (await c.query(
    `SELECT id, slug, quick_ref_ts_snippet, quick_ref_js_snippet, code_snippet_ts, code_snippet_js
     FROM topics ORDER BY slug`,
  )).rows;

  const fixed = [];
  const skipped = [];

  for (const r of rows) {
    const needsTs = r.quick_ref_ts_snippet && PERSIAN.test(r.quick_ref_ts_snippet);
    const needsJs = r.quick_ref_js_snippet && PERSIAN.test(r.quick_ref_js_snippet);
    const missingRef = !r.quick_ref_ts_snippet && !r.quick_ref_js_snippet;

    if (!needsTs && !needsJs && !missingRef) continue;

    const ts = buildQuickRef(r.code_snippet_ts);
    const js = buildQuickRef(r.code_snippet_js);

    if (!ts && !js) {
      skipped.push(r.slug);
      continue;
    }

    await c.query(
      `UPDATE topics SET quick_ref_ts_snippet = $1, quick_ref_js_snippet = $2, updated_at = NOW()
       WHERE id = $3`,
      [ts || '', js || '', r.id],
    );
    fixed.push(r.slug);
  }

  await c.end();
  console.log(`updated ${fixed.length} topics`);
  if (fixed.length) console.log('  ' + fixed.join('\n  '));
  if (skipped.length) console.log(`\nskipped (no English snippet): ${skipped.join(', ')}`);
})().catch((e) => { console.error(e.message); process.exit(1); });
