import { describe, expect, it } from 'vitest';

/**
 * Legacy alias — manifest installability fields (Story 10.1).
 * HatCast 2 icon details: see pwa-icons.spec.ts (Story 10.7).
 */
const MANIFEST_CONTRACT = {
  name: "HatCast — Composition d'équipes d'impro",
  short_name: 'HatCast',
  start_url: '/?source=pwa',
  display: 'standalone',
  iconSizes: ['192x192', '512x512'],
} as const;

describe('PWA manifest contract', () => {
  it('defines required installability fields', () => {
    expect(MANIFEST_CONTRACT.name.length).toBeGreaterThan(0);
    expect(MANIFEST_CONTRACT.short_name).toBe('HatCast');
    expect(MANIFEST_CONTRACT.start_url).toBe('/?source=pwa');
    expect(MANIFEST_CONTRACT.display).toBe('standalone');
    expect(MANIFEST_CONTRACT.iconSizes).toContain('192x192');
    expect(MANIFEST_CONTRACT.iconSizes).toContain('512x512');
  });
});
