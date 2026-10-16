import favIcon from '~/assets/favicons/favicon.svg';
import { eventMeta, isCfpOpen } from '~/domains/event/config/event';
import { EventDay } from '~/domains/event/model/event-day';
import { practicalInfoTopics as practicalInfoTopicsEn } from '~/domains/pages/practical-info/topics/en';
import { practicalInfoTopics as practicalInfoTopicsFr } from '~/domains/pages/practical-info/topics/fr';
import { orderedPracticalInfoTopicKeys } from '~/domains/pages/practical-info/topics/order';
import { isProgramEnabled } from '~/domains/pages/routing/page-flags';
import { getLocalizedPagePath } from '~/i18n/routes';
import type { LocaleDictionaries } from '~/i18n/utils';
import { useTranslations } from '~/i18n/utils';
import type { NavigationLink, NavigationSection } from '~/shared/navigation/types';
import { getPermalink } from '~/shared/url/permalinks';

const practicalInfoTopicsByLocale = {
  en: practicalInfoTopicsEn,
  fr: practicalInfoTopicsFr,
} as const;

const getPracticalInfoLinks = (locale: keyof LocaleDictionaries) => {
  const topics = practicalInfoTopicsByLocale[locale];
  return orderedPracticalInfoTopicKeys.map((topicKey) => ({
    text: topics[topicKey].title,
    href: getPermalink(getLocalizedPagePath(locale, 'practical-info', topicKey)),
    icon: topics[topicKey].icon,
  }));
};

// Both navigation areas share the same sections; only the header promotes priority links.
const getNavigationSections = (locale: keyof LocaleDictionaries, now: Date): NavigationSection[] => {
  const t = useTranslations(locale);
  return [
    {
      id: 'event',
      title: t.footer.event,
      links: [
        ...(isProgramEnabled()
          ? [
              {
                text: t.footer.program,
                href: getPermalink(getLocalizedPagePath(locale, 'program')),
                promotion: 'always' as const,
              },
              {
                text: t.footer.speakers,
                href: getPermalink(getLocalizedPagePath(locale, 'speakers')),
                icon: 'tabler:microphone',
              },
            ]
          : []),
        {
          text: t.header.venueMap,
          href: getPermalink(getLocalizedPagePath(locale, 'venue-map')),
          icon: 'tabler:map',
          promotion: 'event-day',
        },
        {
          text: t.footer.sponsoring,
          href: getPermalink(getLocalizedPagePath(locale, 'sponsoring')),
          icon: 'tabler:heart-handshake',
          promotion: 'other-days',
        },
        ...(isCfpOpen(now)
          ? [{ text: t.header.cfp, href: `${getPermalink(`/${locale}`)}#cfp`, icon: 'tabler:speakerphone' }]
          : []),
      ],
    },
    {
      id: 'practical-info',
      title: t.footer.practicalInfo,
      links: getPracticalInfoLinks(locale),
    },
    {
      id: 'organization',
      title: t.footer.organization,
      links: [
        { text: t.footer.about, href: getPermalink(getLocalizedPagePath(locale, 'about')), icon: 'tabler:users-group' },
        { text: t.footer.contact, href: getPermalink(getLocalizedPagePath(locale, 'contact')), icon: 'tabler:mail' },
        {
          text: t.footer.brandGuidelines,
          href: getPermalink(getLocalizedPagePath(locale, 'brand-guidelines')),
          icon: 'tabler:palette',
        },
      ],
    },
  ];
};

interface HeaderLink extends Partial<NavigationLink> {
  id?: NavigationSection['id'];
  text: string;
  links?: NavigationLink[];
}

export const getHeaderData = (locale: keyof LocaleDictionaries, now: Date = new Date()) => {
  const eventDay = new EventDay(eventMeta.startsAt, eventMeta.timeZone).includes(now);
  const sections = getNavigationSections(locale, now);
  const promoted: HeaderLink[] = [];
  const groups: HeaderLink[] = sections.map((section) => ({
    id: section.id,
    text: section.title,
    links: section.links.flatMap((link, sectionOrder) => {
      const item = section.id === 'event' ? { ...link, sectionOrder } : link;
      if (link.promotion === 'always' || link.promotion === (eventDay ? 'event-day' : 'other-days')) {
        promoted.push(item);
        return [];
      }
      return [item];
    }),
  }));
  return {
    links: [...promoted, ...groups],
    eventNavigation: { startsAt: eventMeta.startsAt, timeZone: eventMeta.timeZone, eventDay },
  };
};

export const getFooterData = (locale: keyof LocaleDictionaries, now: Date = new Date()) => {
  const t = useTranslations(locale);

  return {
    links: getNavigationSections(locale, now),
    secondaryLinks: [
      { text: t.footer.terms, href: getPermalink(getLocalizedPagePath(locale, 'terms')) },
      { text: t.footer.privacy, href: getPermalink(getLocalizedPagePath(locale, 'privacy')) },
    ],
    socialLinks: [],
    footNote: `
      <img class="w-5 h-5 md:w-6 md:h-6 md:-mt-0.5 bg-cover mr-1.5 rtl:mr-0 rtl:ml-1.5 float-left rtl:float-right rounded-sm" src="${favIcon.src}" alt="${t.footer.logoAlt}" loading="lazy" />
      ${t.footer.note}
    `,
  };
};
