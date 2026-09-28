import type { ProgramScheduleLabels } from '~/domains/pages/program/components/program-schedule.types';
import programSchedule from '~/domains/pages/program/content/schedule';
import type { ProgramSession, ProgramSpeaker } from '~/domains/pages/program/model/schedule';
import type { MetaData } from '~/types';

export interface SpeakersPageData {
  metadata: MetaData;
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    programLabel: string;
  };
  section: {
    title: string;
    emptyState: string;
  };
  labels: Pick<ProgramScheduleLabels, 'closeLabel' | 'speakerProfileLabel' | 'speakerLinksLabel'> & {
    viewProfileLabel: string;
    searchLabel: string;
    searchPlaceholder: string;
    clearSearchLabel: string;
    resultsLabel: string;
    noResultsTitle: string;
    noResultsText: string;
  };
  speakers: readonly ProgramSpeaker[];
}

type SpeakersPageStaticContent = {
  metadata: MetaData;
  hero: SpeakersPageData['hero'];
  section: SpeakersPageData['section'];
  labels: SpeakersPageData['labels'];
};

const mergeSocialLinks = (
  existing: readonly string[] | undefined,
  incoming: readonly string[] | undefined
): readonly string[] | undefined => {
  const links = [...(existing ?? []), ...(incoming ?? [])];

  return links.length ? [...new Set(links)] : undefined;
};

const mergeSpeakerProfiles = (existing: ProgramSpeaker | undefined, incoming: ProgramSpeaker): ProgramSpeaker => ({
  id: existing?.id ?? incoming.id,
  name: existing?.name ?? incoming.name,
  bio: incoming.bio ?? existing?.bio,
  company: incoming.company ?? existing?.company,
  picture: incoming.picture ?? existing?.picture,
  socialLinks: mergeSocialLinks(existing?.socialLinks, incoming.socialLinks),
});

export const getPublishedProgramSpeakers = (sessions: readonly ProgramSession[]): ProgramSpeaker[] => {
  const speakers = new Map<string, ProgramSpeaker>();

  for (const session of sessions) {
    for (const speaker of session.speakers ?? []) {
      speakers.set(speaker.id, mergeSpeakerProfiles(speakers.get(speaker.id), speaker));
    }
  }

  return [...speakers.values()].sort((left, right) =>
    left.name.localeCompare(right.name, 'en', { sensitivity: 'base' })
  );
};

export const buildSpeakersPageData = (
  content: SpeakersPageStaticContent,
  sessions: readonly ProgramSession[] = programSchedule.sessions
): SpeakersPageData => ({
  ...content,
  speakers: getPublishedProgramSpeakers(sessions),
});
