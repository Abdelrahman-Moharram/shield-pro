import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { syncPreview } from '../../scripts/sync-preview.mjs';

describe('syncPreview script', () => {
  const tempDirs: string[] = [];

  const createTempDir = () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sync-preview-test-'));
    tempDirs.push(dir);
    return dir;
  };

  afterEach(() => {
    for (const dir of tempDirs) {
      try {
        fs.rmSync(dir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
    tempDirs.length = 0;
  });

  it('copies a collection and a string; skips empty values, keeps other keys untouched', () => {
    const dir = createTempDir();
    const twilightFile = path.join(dir, 'twilight.json');
    const previewFile = path.join(dir, 'twilight.preview.json');

    const twilightData = {
      name: 'Test Theme',
      settings: [
        { id: 'site_tagline', value: 'Car Care Specialists' },
        { id: 'branch_list', value: [{ city: 'Riyadh', name: 'Main Branch' }] },
        { id: 'empty_string_setting', value: '' },
        { id: 'empty_array_setting', value: [] },
        { id: 'null_setting', value: null },
        { id: 'no_value_setting' },
      ],
    };

    const initialPreviewData = {
      enabled: true,
      custom_header: 'preserved',
      settings: {
        existing_setting: 'keep_this_value',
      },
    };

    fs.writeFileSync(twilightFile, JSON.stringify(twilightData, null, 2) + '\n', 'utf8');
    fs.writeFileSync(previewFile, JSON.stringify(initialPreviewData, null, 2) + '\n', 'utf8');

    const copiedIds = syncPreview(twilightFile, previewFile);

    expect(copiedIds).toContain('site_tagline');
    expect(copiedIds).toContain('branch_list');
    expect(copiedIds).not.toContain('empty_string_setting');
    expect(copiedIds).not.toContain('empty_array_setting');
    expect(copiedIds).not.toContain('null_setting');
    expect(copiedIds).not.toContain('no_value_setting');

    const rawResult = fs.readFileSync(previewFile, 'utf8');
    expect(rawResult.endsWith('\n')).toBe(true);
    expect(rawResult.includes('\r\n')).toBe(false);

    const updatedPreview = JSON.parse(rawResult);
    expect(updatedPreview.enabled).toBe(true);
    expect(updatedPreview.custom_header).toBe('preserved');
    expect(updatedPreview.settings.existing_setting).toBe('keep_this_value');
    expect(updatedPreview.settings.site_tagline).toBe('Car Care Specialists');
    expect(updatedPreview.settings.branch_list).toEqual([{ city: 'Riyadh', name: 'Main Branch' }]);
    expect(updatedPreview.settings.empty_string_setting).toBeUndefined();
    expect(updatedPreview.settings.empty_array_setting).toBeUndefined();
  });
});
