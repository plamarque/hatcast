import { describe, expect, it } from 'vitest';

import { getPwaBrowserInfo } from './pwa-browser-info';
import { buildPwaInstallInstructions } from './pwa-install-instructions';

describe('buildPwaInstallInstructions', () => {
  it('returns Chrome desktop steps for Windows Chrome UA', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.title).toContain('Chrome');
    expect(content.steps.length).toBeGreaterThan(0);
    expect(content.canRetry).toBe(true);
  });

  it('flags Firefox as alternative-needed', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    );
    const content = buildPwaInstallInstructions(info);
    expect(content.isAlternativeNeeded).toBe(true);
    expect(content.canRetry).toBe(false);
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

  it('prepends dev cert warning when devCertBlocked', () => {
    const info = getPwaBrowserInfo(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    );
    const content = buildPwaInstallInstructions(info, { devCertBlocked: true });
    expect(content.warningText).toContain('Non sécurisé');
    expect(content.warningText).toContain('localhost:4200');
  });
});
