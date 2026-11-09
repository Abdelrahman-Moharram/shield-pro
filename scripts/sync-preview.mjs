import fs from 'node:fs';

export function syncPreview(twilightPath = 'twilight.json', previewPath = 'twilight.preview.json') {
  const twilight = JSON.parse(fs.readFileSync(twilightPath, 'utf8'));
  const preview = JSON.parse(fs.readFileSync(previewPath, 'utf8'));
  preview.settings = preview.settings || {};
  const copied = [];
  for (const s of twilight.settings || []) {
    const val = s?.value;
    const isEmpty = val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
    if (s?.id && !isEmpty) {
      preview.settings[s.id] = val;
      copied.push(s.id);
    }
  }
  fs.writeFileSync(previewPath, JSON.stringify(preview, null, 2) + '\n');
  return copied;
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('scripts/sync-preview.mjs')) {
  const copied = syncPreview(process.argv[2], process.argv[3]);
  console.log(`Synced ${copied.length} settings: ${copied.join(', ')}`);
}
