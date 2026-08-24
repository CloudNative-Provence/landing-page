import favIcon from '~/assets/favicons/favicon.svg';
import { isCfpOpen } from '~/domains/event/config/event';
import { practicalInfoTopics as practicalInfoTopicsEn } from '~/domains/pages/practical-info/topics/en';
import { practicalInfoTopics as practicalInfoTopicsFr } from '~/domains/pages/practical-info/topics/fr';
import { orderedPracticalInfoTopicKeys } from '~/domains/pages/practical-info/topics/order';
import { isProgramEnabled } from '~/domains/pages/routing/page-flags';
import { getLocalizedPagePath } from '~/i18n/routes';
import type { LocaleDictionaries } from '~/i18n/utils';
import { useTranslations } from '~/i18n/utils';
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
  }));
};

// Function to get locale-aware navigation
export const getHeaderData = (locale: keyof LocaleDictionaries, now: Date = new Date()) => {
  const t = useTranslations(locale);
  const cfpOpen = isCfpOpen(now);
  const practicalInfoLinks = getPracticalInfoLinks(locale);

  return {
    links: [
      ...(isProgramEnabled()
        ? [
            {
              text: t.header.program,
              href: getPermalink(getLocalizedPagePath(locale, 'program')),
            },
          ]
        : []),
      ...(cfpOpen
        ? [
            {
              text: t.header.cfp,
              href: `${getPermalink(`/${locale}`)}#cfp`,
            },
          ]
        : []),
      {
        text: t.header.sponsoring,
        href: getPermalink(getLocalizedPagePath(locale, 'sponsoring')),
      },
      {
        text: t.header.practicalInfo,
        links: practicalInfoLinks,
      },
      {
        text: t.header.about,
        href: getPermalink(getLocalizedPagePath(locale, 'about')),
      },
      {
        text: t.header.contact,
        href: getPermalink(getLocalizedPagePath(locale, 'contact')),
      },
    ],
  };
};

export const getFooterData = (locale: keyof LocaleDictionaries) => {
  const t = useTranslations(locale);
  const practicalInfoLinks = getPracticalInfoLinks(locale);

  return {
    links: [
      {
        title: t.footer.event,
        links: [
          ...(isProgramEnabled()
            ? [{ text: t.footer.program, href: getPermalink(getLocalizedPagePath(locale, 'program')) }]
            : []),
          { text: t.footer.sponsoring, href: getPermalink(getLocalizedPagePath(locale, 'sponsoring')) },
        ],
      },
      {
        title: t.footer.practicalInfo,
        links: practicalInfoLinks,
      },
      {
        title: t.footer.organization,
        links: [
          { text: t.footer.about, href: getPermalink(getLocalizedPagePath(locale, 'about')) },
          { text: t.footer.brandGuidelines, href: getPermalink(getLocalizedPagePath(locale, 'brand-guidelines')) },
          { text: t.footer.contact, href: getPermalink(getLocalizedPagePath(locale, 'contact')) },
        ],
      },
    ],
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
