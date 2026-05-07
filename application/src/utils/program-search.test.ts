import { describe, expect, it } from 'vitest';

import { ProgramSearchTextNormalizer } from './program-search';

describe('ProgramSearchTextNormalizer', () => {
  it('normalizes diacritics and whitespace', () => {
    expect(ProgramSearchTextNormalizer.normalize('  Déjeuner   Équipe  ')).toBe('dejeuner equipe');
  });

  it('builds searchable session text from session data and labels', () => {
    const searchText = ProgramSearchTextNormalizer.fromSession(
      {
        id: 'opening',
        title: 'Keynote d’ouverture',
        description: 'Une session pour l’équipe plateforme',
        startsAt: '2026-12-10T09:00:00+01:00',
        endsAt: '2026-12-10T09:40:00+01:00',
        trackIds: ['platform'],
        roomIds: ['auditorium'],
        speakers: ['Émilien Escalle'],
        format: 'Talk',
        tags: ['résilience'],
      },
      new Map([['platform', 'Plateforme']]),
      new Map([['auditorium', 'Grand Auditorium']])
    );

    expect(searchText).toContain('keynote douverture');
    expect(searchText).toContain('equipe');
    expect(searchText).toContain('emilien escalle');
    expect(searchText).toContain('resilience');
    expect(searchText).toContain('plateforme');
  });
});
