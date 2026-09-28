import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { stayThumbnails } from './stay-thumbnail';

describe('accommodation stay thumbnails', () => {
  it('resolves every property photo to an existing local WebP asset', () => {
    for (const thumbnail of Object.values(stayThumbnails)) {
      expect(thumbnail.src).toMatch(/^~\/assets\/images\/pages\/practical-info\/accommodation\/.+\.webp$/);
      const assetUrl = new URL(thumbnail.src.replace('~/', '../../../../../'), import.meta.url);
      expect(existsSync(assetUrl), thumbnail.src).toBe(true);
      expect(new URL(thumbnail.sourceHref).protocol).toBe('https:');
      expect(thumbnail.credit.trim().length).toBeGreaterThan(0);
    }
  });
});
