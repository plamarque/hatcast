import { describe, expect, it } from 'vitest';

import { getPwaBrowserInfo } from './pwa-browser-info';
import { buildPwaInstallInstructions } from './pwa-install-instructions';

const CHROME_ANDROID_UA =
  'Mozilla/5.0 (Linux; Android 14; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

describe('buildPwaInstallInstructions', () => {
  it('returns Chrome desktop steps for Windows Chrome UA', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Chrome');
    expect(content.steps.length).toBeGreaterThan(0);
    expect(content.alternativeText).toContain('/icons/chrome-cast-save-share-menu.png');
    expect(content.alternativeText).toContain('Caster, enregistrer et partager');
  });

  it('returns Chrome Android steps without astuce or note importante', () => {
    const info = getPwaBrowserInfo(CHROME_ANDROID_UA);
    expect(info.isChromeMobile).toBe(true);
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toBe('Chrome sur Android');
    expect(content.alternativeText).toBe('');
    expect(content.warningText).toBe('');
    expect(content.steps.some((s) => s.includes('⋮'))).toBe(true);
  });

  it('flags Firefox as alternative-needed', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.isAlternativeNeeded).toBe(true);
  });

  it('flags Firefox on Android before generic Android copy', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Android 14; Mobile; rv:121.0) Gecko/121.0 Firefox/121.0',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Firefox');
    expect(content.isAlternativeNeeded).toBe(true);
  });

  it('returns Safari iOS steps', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Safari');
    expect(content.steps.some((s) => s.includes('écran d\'accueil'))).toBe(true);
  });

  it('embeds HatCast 2 logo in install success copy', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.successText).toContain('/icons/logo-hatcast-2.svg');
  });

  it('returns Edge desktop steps on Windows Edge UA', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Edge');
    expect(content.title).toContain('Windows');
    expect(content.steps.some((s) => s.includes('/icons/chrome-install-address-bar.png'))).toBe(
      true,
    );
    expect(content.alternativeText).toContain('Applications');
  });

  it('returns Samsung Internet steps', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/23.0 Chrome/115.0.0.0 Mobile Safari/537.36',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toBe('Samsung Internet');
    expect(content.steps.some((s) => s.includes('＋'))).toBe(true);
    expect(content.successText).toContain('/icons/logo-hatcast-2.svg');
  });

  it('returns Chrome iOS 16.4+ A2HS steps', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Chrome');
    expect(content.isAlternativeNeeded).toBe(false);
    expect(content.steps.some((s) => s.includes('Partager'))).toBe(true);
  });

  it('returns Chrome iOS <16.4 Safari fallback steps', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.isAlternativeNeeded).toBe(true);
    expect(content.steps.some((s) => s.includes('Safari'))).toBe(true);
    expect(content.alternativeText).toContain('16.4');
  });

  it('returns generic Android steps for unknown mobile browser', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Linux; Android 14; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Mobile Safari/537.36',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toBe('Navigateur Android');
    expect(content.warningText).toContain('Chrome ou Samsung Internet');
  });
});
