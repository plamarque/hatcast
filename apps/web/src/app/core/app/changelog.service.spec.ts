import { describe, expect, it } from 'vitest';

import {
  compareSemverDescending,
  parseChangelogChange,
  transformChangelogVersions,
  type ChangelogVersionRaw,
} from './changelog.service';

describe('parseChangelogChange', () => {
  it('splits emoji and description', () => {
    expect(parseChangelogChange('✨ Nouvelle fonction', '1.0.0', 0)).toEqual({
      id: '1.0.0-0',
      emoji: '✨',
      description: 'Nouvelle fonction',
    });
  });

  it('uses default emoji when line has no space', () => {
    expect(parseChangelogChange('Correctionmineure', '1.0.0', 1)).toEqual({
      id: '1.0.0-1',
      emoji: '📝',
      description: 'Correctionmineure',
    });
  });
});

describe('compareSemverDescending', () => {
  it('orders newer versions first', () => {
    expect(compareSemverDescending('1.2.0', '1.10.0')).toBeGreaterThan(0);
    expect(compareSemverDescending('2.0.0', '1.9.9')).toBeLessThan(0);
  });
});

describe('transformChangelogVersions', () => {
  it('sorts versions descending and transforms changes', () => {
    const raw: ChangelogVersionRaw[] = [
      {
        version: '0.1.0',
        date: '2026-01-01',
        changes: ['🐛 Fix'],
      },
      {
        version: '0.2.0',
        date: '2026-02-01',
        changes: ['✨ Feature'],
      },
    ];

    const result = transformChangelogVersions(raw);

    expect(result.map((v) => v.version)).toEqual(['0.2.0', '0.1.0']);
    expect(result[0].changes[0].emoji).toBe('✨');
  });
});
