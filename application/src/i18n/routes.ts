import { languages } from './config';

export type AppLang = keyof typeof languages;

export const routeSlugs = {
  about: { en: 'about', fr: 'a-propos' },
  contact: { en: 'contact', fr: 'contact' },
  'practical-info': { en: 'practical-information', fr: 'infos-pratiques' },
  program: { en: 'program', fr: 'programme' },
  sponsoring: { en: 'sponsoring', fr: 'sponsoring' },
  'brand-guidelines': { en: 'brand-guidelines', fr: 'charte-graphique' },
  terms: { en: 'terms-of-service', fr: 'conditions-generales-utilisation' },
  privacy: { en: 'privacy-policy', fr: 'politique-de-confidentialite' },
} as const;

export type RouteKey = keyof typeof routeSlugs;

export const practicalInfoTopicSlugs = {
  accommodation: { en: 'accommodation', fr: 'hebergement' },
  'getting-there': { en: 'getting-there', fr: 'venir' },
  activities: { en: 'activities', fr: 'activites' },
  parking: { en: 'parking', fr: 'parkings' },
} as const;

export type PracticalInfoTopicKey = keyof typeof practicalInfoTopicSlugs;

const getTopicSlug = (lang: AppLang, routeKey: RouteKey, topicKey?: PracticalInfoTopicKey): string | undefined => {
  if (routeKey !== 'practical-info' || !topicKey) {
    return undefined;
  }

  return practicalInfoTopicSlugs[topicKey][lang];
};

export const getLocalizedPagePath = (lang: AppLang, routeKey: RouteKey, topicKey?: PracticalInfoTopicKey): string => {
  const topicSlug = getTopicSlug(lang, routeKey, topicKey);
  return `/${lang}/${[routeSlugs[routeKey][lang], topicSlug].filter(Boolean).join('/')}`;
};

export const getRouteKeyFromSlug = (lang: AppLang, slug: string): RouteKey | undefined => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const entries = Object.entries(routeSlugs) as [RouteKey, (typeof routeSlugs)[RouteKey]][];
  const found = entries.find(([, localizedSlugs]) => localizedSlugs[lang] === normalizedSlug);
  return found?.[0];
};

export const getPracticalInfoTopicKeyFromSlug = (lang: AppLang, slug: string): PracticalInfoTopicKey | undefined => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const entries = Object.entries(practicalInfoTopicSlugs) as [
    PracticalInfoTopicKey,
    (typeof practicalInfoTopicSlugs)[PracticalInfoTopicKey],
  ][];
  const found = entries.find(([, localizedSlugs]) => localizedSlugs[lang] === normalizedSlug);
  return found?.[0];
};

export const translatePathToLang = (path: string, targetLang: AppLang): string => {
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return `/${targetLang}`;

  const sourceLang = parts[0] as AppLang;
  if (!(sourceLang in languages)) {
    return `/${targetLang}`;
  }

  if (parts.length === 1) return `/${targetLang}`;

  const sourceSlug = parts[1];
  const routeKey = getRouteKeyFromSlug(sourceLang, sourceSlug);
  if (!routeKey) {
    return `/${targetLang}/${parts.slice(1).join('/')}`;
  }

  const translatedSlug = routeSlugs[routeKey][targetLang];
  const rest = parts.slice(2);

  if (routeKey === 'practical-info' && rest.length > 0) {
    const [sourceTopicSlug, ...remaining] = rest;
    const topicKey = getPracticalInfoTopicKeyFromSlug(sourceLang, sourceTopicSlug);
    const translatedTopicSlug = topicKey ? practicalInfoTopicSlugs[topicKey][targetLang] : sourceTopicSlug;

    return `/${targetLang}/${[translatedSlug, translatedTopicSlug, ...remaining].join('/')}`;
  }

  return `/${targetLang}/${[translatedSlug, ...rest].join('/')}`;
};
