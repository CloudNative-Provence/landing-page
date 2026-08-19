import favIcon from '~/assets/favicons/favicon.svg';
import { isCfpOpen } from './data/meta/event';
import { getLocalizedPagePath } from './i18n/routes';
import type { LocaleDictionaries } from './i18n/utils';
import { useTranslations } from './i18n/utils';
import { isProgramEnabled } from './utils/page-routes';
import { getPermalink } from './utils/permalinks';

// Function to get locale-aware navigation
export const getHeaderData = (locale: keyof LocaleDictionaries, now: Date = new Date()) => {
  const t = useTranslations(locale);
  const cfpOpen = isCfpOpen(now);

  return {
    links: [
      ...(isProgramEnabled()
        ? [
            {
              text: t.nav.program,
              href: getPermalink(getLocalizedPagePath(locale, 'program')),
            },
          ]
        : []),
      ...(cfpOpen
        ? [
            {
              text: t.nav.cfp,
              href: `${getPermalink(`/${locale}`)}#cfp`,
            },
          ]
        : []),
      {
        text: t.nav.sponsoring,
        href: getPermalink(getLocalizedPagePath(locale, 'sponsoring')),
      },
      {
        text: t.nav.about,
        href: getPermalink(getLocalizedPagePath(locale, 'about')),
      },
      {
        text: t.nav.contact,
        href: getPermalink(getLocalizedPagePath(locale, 'contact')),
      },
    ],
  };
};

export const getFooterData = (locale: keyof LocaleDictionaries) => {
  const t = useTranslations(locale);

  return {
    links: [
      {
        title: t.footer.event,
        links: [
          ...(isProgramEnabled()
            ? [{ text: t.footer.program, href: getPermalink(getLocalizedPagePath(locale, 'program')) }]
            : []),
          { text: t.footer.sponsoring, href: getPermalink(getLocalizedPagePath(locale, 'sponsoring')) },
          { text: t.footer.practicalInfo, href: getPermalink(getLocalizedPagePath(locale, 'practical-info')) },
        ],
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
