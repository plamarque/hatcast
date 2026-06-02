import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

/** Vitest cwd for `@hatcast/web` is `apps/web/`. */
const PUBLIC_DIR = join(process.cwd(), 'public');
const ICONS_DIR = join(PUBLIC_DIR, 'icons');
const MANIFEST_PATH = join(PUBLIC_DIR, 'manifest.webmanifest');

const REQUIRED_ICON_FILES = [
  'logo-hatcast-2.svg',
  'favicon-hatcast-2.svg',
  'icon-192.png',
  'icon-512.png',
  'manifest-icon-192.maskable.png',
  'manifest-icon-512.maskable.png',
  'apple-icon-180.png',
  'favicon.ico',
  'favicon.svg',
  'favicon-16.png',
  'favicon-32.png',
  'icon-48x48.png',
  'mstile-150x150.png',
  'chrome-install-address-bar.png',
  'chrome-install-address-bar@2x.png',
  'chrome-cast-save-share-menu.png',
  'chrome-cast-save-share-menu@2x.png',
] as const;

/** HatCast 2 brand tokens — sync with logo-hatcast-2.svg */
const HATCAST2_BRAND = {
  primary: '#6750A4',
  maskableBackground: '#EADDFF',
  tertiaryAccent: '#FF9800',
  forbiddenV1Blue: '#0ea5e9',
} as const;

interface ManifestIcon {
  src: string;
  sizes: string;
  type?: string;
  purpose: string;
}

interface WebManifest {
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
}

function readManifest(): WebManifest {
  return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as WebManifest;
}

describe('PWA HatCast 2 icon contract', () => {
  it('has all required icon files under public/icons/', () => {
    for (const filename of REQUIRED_ICON_FILES) {
      expect(existsSync(join(ICONS_DIR, filename)), `missing public/icons/${filename}`).toBe(
        true,
      );
    }
  });

  it('logo SVG uses M3 violet brand, not V1 sky blue', () => {
    const svg = readFileSync(join(ICONS_DIR, 'logo-hatcast-2.svg'), 'utf8');
    expect(svg).toContain(HATCAST2_BRAND.primary);
    expect(svg).not.toContain(HATCAST2_BRAND.forbiddenV1Blue);
  });
});

describe('PWA manifest on disk', () => {
  it('declares split any + maskable icons and V2 theme colors', () => {
    const manifest = readManifest();

    expect(manifest.theme_color).toBe(HATCAST2_BRAND.primary);
    expect(manifest.background_color).toBe('#FFFBFE');

    const purposes = manifest.icons.map((icon) => icon.purpose);
    expect(purposes).toContain('any');
    expect(purposes).toContain('maskable');

    const sizes = manifest.icons.map((icon) => icon.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');

    expect(manifest.icons.some((icon) => icon.src.includes('icon-192.png'))).toBe(true);
    expect(
      manifest.icons.some((icon) => icon.src.includes('manifest-icon-512.maskable.png')),
    ).toBe(true);
  });
});
