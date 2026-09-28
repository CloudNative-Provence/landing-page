import { describe, expect, it } from 'vitest';

import { buildSpeakersPageData, getPublishedProgramSpeakers } from './page-data';

describe('speakers page data', () => {
  it('deduplicates speaker profiles, merges public details, and sorts speakers by name', () => {
    const speakers = getPublishedProgramSpeakers([
      {
        id: 'session-1',
        title: 'Session one',
        description: 'Description',
        startsAt: '2026-12-10T08:00:00Z',
        endsAt: '2026-12-10T08:30:00Z',
        speakers: [
          { id: 'speaker-b', name: 'Zoé Speaker', socialLinks: ['https://example.com/z'] },
          { id: 'speaker-a', name: 'Alice Cloud', company: 'Cloud Native Provence' },
        ],
      },
      {
        id: 'session-2',
        title: 'Session two',
        description: 'Description',
        startsAt: '2026-12-10T09:00:00Z',
        endsAt: '2026-12-10T09:30:00Z',
        speakers: [
          {
            id: 'speaker-b',
            name: 'Zoé Speaker',
            bio: 'Speaker biography',
            picture: 'https://example.com/zoe.png',
            socialLinks: ['https://example.com/z', 'https://example.com/in/zoe'],
          },
        ],
      },
    ]);

    expect(speakers).toEqual([
      { id: 'speaker-a', name: 'Alice Cloud', company: 'Cloud Native Provence', socialLinks: undefined },
      {
        id: 'speaker-b',
        name: 'Zoé Speaker',
        bio: 'Speaker biography',
        picture: 'https://example.com/zoe.png',
        socialLinks: ['https://example.com/z', 'https://example.com/in/zoe'],
      },
    ]);
  });

  it('builds page data with the published speakers list', () => {
    const page = buildSpeakersPageData(
      {
        metadata: { title: 'Speakers' },
        hero: { tagline: 'Speakers', title: 'Meet the speakers', subtitle: 'Conference speakers' },
        section: { title: 'Published speakers', subtitle: 'Browse profiles', emptyState: 'No speakers yet.' },
        labels: {
          closeLabel: 'Close',
          speakerProfileLabel: 'View profile: {name}',
          speakerLinksLabel: 'Find this speaker online',
        },
      },
      [
        {
          id: 'session-1',
          title: 'Session one',
          description: 'Description',
          startsAt: '2026-12-10T08:00:00Z',
          endsAt: '2026-12-10T08:30:00Z',
          speakers: [{ id: 'speaker-a', name: 'Alice Cloud' }],
        },
      ]
    );

    expect(page.speakers).toEqual([{ id: 'speaker-a', name: 'Alice Cloud', socialLinks: undefined }]);
    expect(page.section.title).toBe('Published speakers');
  });
});
