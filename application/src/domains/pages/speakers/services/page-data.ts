import type { ProgramScheduleLabels } from '~/domains/pages/program/components/program-schedule.types';
import programSchedule from '~/domains/pages/program/content/schedule';
import type { ProgramSession, ProgramSpeaker } from '~/domains/pages/program/model/schedule';
import type { MetaData } from '~/types';

export interface SpeakersPageData {
  [key: string]: unknown;
  metadata: MetaData;
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
  };
  section: {
    title: string;
    subtitle: string;
    emptyState: string;
  };
  labels: Pick<ProgramScheduleLabels, 'closeLabel' | 'speakerProfileLabel' | 'speakerLinksLabel'>;
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
  bio: existing?.bio ?? incoming.bio,
  company: existing?.company ?? incoming.company,
  picture: existing?.picture ?? incoming.picture,
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
