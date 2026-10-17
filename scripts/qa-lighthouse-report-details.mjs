import fs from 'node:fs';
import path from 'node:path';

const directory = path.resolve('.lighthouseci');
if (!fs.existsSync(directory)) {
  console.log('No .lighthouseci directory exists; no Lighthouse JSON diagnostics available.');
  process.exit(0);
}

const files = fs.readdirSync(directory).filter(name => name.endsWith('.json') && name.startsWith('lhr-'));
if (!files.length) {
  console.log('No Lighthouse JSON reports found for diagnostic output.');
  process.exit(0);
}

const keyAudits = [
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'interactive',
  'speed-index',
  'label-content-name-mismatch',
  'color-contrast',
  'aria-prohibited-attr',
  'mainthread-work-breakdown',
  'long-tasks'
];

for (const file of files) {
  let report;
  try {
    report = JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8'));
  } catch (error) {
    console.log(`Could not parse ${file}: ${error.message}`);
    continue;
  }

  const url = report.finalDisplayedUrl || report.finalUrl || report.requestedUrl || file;
  console.log(`\nLighthouse diagnostics: ${url}`);
  for (const id of keyAudits) {
    const audit = report.audits?.[id];
    if (!audit) continue;
    const shouldPrint = id === 'label-content-name-mismatch' || id === 'color-contrast' || id === 'aria-prohibited-attr'
      ? audit.score !== 1
      : ['largest-contentful-paint', 'total-blocking-time', 'cumulative-layout-shift', 'interactive', 'speed-index', 'mainthread-work-breakdown', 'long-tasks'].includes(id);
    if (!shouldPrint) continue;
    console.log(`  ${id}: score=${audit.score} value=${audit.displayValue || audit.numericValue || 'n/a'}`);
    for (const item of (audit.details?.items || []).slice(0, 8)) {
      const node = item.node;
      if (node) {
        console.log(`    selector: ${node.selector || '(no selector)'}`);
        console.log(`    snippet: ${node.snippet || '(no snippet)'}`);
        if (node.failureSummary) console.log(`    failure: ${node.failureSummary}`);
      } else if (item.url || item.duration || item.totalBytes) {
        console.log(`    detail: ${JSON.stringify(item).slice(0, 700)}`);
      }
    }
  }
}
