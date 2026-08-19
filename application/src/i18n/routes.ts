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

export const getLocalizedPagePath = (lang: AppLang, routeKey: RouteKey): string => {
  return `/${lang}/${routeSlugs[routeKey][lang]}`;
};

export const getRouteKeyFromSlug = (lang: AppLang, slug: string): RouteKey | undefined => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, '');
  const entries = Object.entries(routeSlugs) as [RouteKey, (typeof routeSlugs)[RouteKey]][];
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
  return `/${targetLang}/${[translatedSlug, ...rest].join('/')}`;
};
