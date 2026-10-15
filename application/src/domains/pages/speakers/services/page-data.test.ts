import { describe, expect, it } from 'vitest';

import type { ProgramSession } from '~/domains/pages/program/model/schedule';
import { buildSpeakersPageData, getPublishedProgramSpeakers } from './page-data';

const content = {
  metadata: { title: 'Speakers' },
  hero: {
    tagline: 'Speakers',
    title: 'Meet the speakers',
    subtitle: 'Conference speakers',
    programLabel: 'Program',
  },
  section: { title: 'Published speakers', emptyState: 'No speakers yet.' },
  labels: {
    closeLabel: 'Close',
    speakerProfileLabel: 'View profile: {name}',
    speakerLinksLabel: 'Find this speaker online',
    viewProfileLabel: 'Meet the speaker',
    talkLabel: 'Talk',
    talksLabel: 'Talks',
    talkDescriptionLabel: 'Talk description',
    viewInScheduleLabel: 'View in schedule',
    searchLabel: 'Find a speaker',
    searchPlaceholder: 'Name or company',
    clearSearchLabel: 'Clear search',
    resultsLabel: '{count} / {total}',
    noResultsTitle: 'No speakers found',
    noResultsText: 'Try another name or company.',
  },
};

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
            company: 'Cloud Corp',
            picture: 'https://example.com/zoe.png',
            socialLinks: ['https://example.com/z', 'https://example.com/in/zoe'],
          },
        ],
      },
    ]);

    expect(speakers).toStrictEqual([
      {
        id: 'speaker-a',
        name: 'Alice Cloud',
        bio: undefined,
        company: 'Cloud Native Provence',
        picture: undefined,
        socialLinks: undefined,
      },
      {
        id: 'speaker-b',
        name: 'Zoé Speaker',
        bio: 'Speaker biography',
        company: 'Cloud Corp',
        picture: 'https://example.com/zoe.png',
        socialLinks: ['https://example.com/z', 'https://example.com/in/zoe'],
      },
    ]);
  });

  it('builds page data with the published speakers list', () => {
    const page = buildSpeakersPageData(content, [
      {
        id: 'session-1',
        title: 'Session one',
        description: 'Description',
        startsAt: '2026-12-10T08:00:00Z',
        endsAt: '2026-12-10T08:30:00Z',
        speakers: [{ id: 'speaker-a', name: 'Alice Cloud' }],
      },
    ]);

    expect(page.speakers).toMatchObject([
      {
        id: 'speaker-a',
        name: 'Alice Cloud',
        bio: undefined,
        company: undefined,
        picture: undefined,
        socialLinks: undefined,
        sessions: [{ id: 'session-1', title: 'Session one', description: 'Description' }],
      },
    ]);
    expect(page.section.title).toBe('Published speakers');
  });

  it('associates all talks by speaker ID, including co-speakers, in chronological order', () => {
    const alice = { id: 'alice', name: 'Alice Cloud' };
    const bob = { id: 'bob', name: 'Bob Cloud' };
    const namesake = { id: 'other-alice', name: 'Alice Cloud' };
    const morning: ProgramSession = {
      id: 'morning',
      title: 'Shared talk',
      description: 'Presented together',
      startsAt: '2026-12-10T08:00:00Z',
      endsAt: '2026-12-10T08:30:00Z',
      speakers: [alice, bob],
    };
    const afternoon = {
      ...morning,
      id: 'afternoon',
      title: 'Another talk',
      startsAt: '2026-12-10T13:00:00Z',
      endsAt: '2026-12-10T13:30:00Z',
      speakers: [alice],
    };
    const sessions = [
      afternoon,
      { ...morning, id: 'unrelated', speakers: [namesake] },
      { ...morning, id: 'break', speakers: undefined },
      morning,
    ];
    const original = structuredClone(sessions);

    const page = buildSpeakersPageData(content, sessions);
    const sessionIds = (speakerId: string) =>
      page.speakers.find((speaker) => speaker.id === speakerId)?.sessions.map((session) => session.id);

    expect(sessionIds('alice')).toEqual(['morning', 'afternoon']);
    expect(sessionIds('bob')).toEqual(['morning']);
    expect(sessionIds('other-alice')).toEqual(['unrelated']);
    expect(sessions).toEqual(original);
  });

  it('shows a talk broadcast in every room only once for its speaker', () => {
    const rooms = [
      { id: 'main', label: 'Main room', accent: 'blue' },
      { id: 'second', label: 'Second room', accent: 'green' },
    ];
    const keynote: ProgramSession = {
      id: 'keynote-main',
      title: 'Opening keynote',
      description: 'Keynote description',
      startsAt: '2026-12-10T08:00:00Z',
      endsAt: '2026-12-10T08:30:00Z',
      roomId: 'main',
      speakers: [{ id: 'alice', name: 'Alice Cloud' }],
    };

    const page = buildSpeakersPageData(
      content,
      [keynote, { ...keynote, id: 'keynote-second', roomId: 'second' }],
      rooms
    );

    expect(page.speakers).toHaveLength(1);
    expect(page.speakers[0].sessions).toHaveLength(1);
    expect(page.speakers[0].sessions[0].title).toBe('Opening keynote');
  });

  it('handles an empty published schedule', () => {
    expect(buildSpeakersPageData(content, []).speakers).toEqual([]);
  });
});
