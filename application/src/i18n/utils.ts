import metaEn from '../data/meta/en';
import metaFr from '../data/meta/fr';
import navigationEn from '../data/navigation/en';
import navigationFr from '../data/navigation/fr';
import { defaultLang } from './config';

export const sourceLocales = {
  fr: {
    ...navigationFr,
    ...metaFr,
  },
  en: {
    ...navigationEn,
    ...metaEn,
  },
} as const;

export type LocaleDictionaries = typeof sourceLocales;

const mergeTranslations = (primary: unknown, fallback: unknown): unknown => {
  if (typeof fallback === 'string') {
    return typeof primary === 'string' && primary !== '' ? primary : fallback;
  }

  if (typeof fallback !== 'object' || fallback === null) {
    return primary ?? fallback;
  }

  const fallbackEntries = Object.entries(fallback as Record<string, unknown>);
  const primaryRecord = typeof primary === 'object' && primary !== null ? (primary as Record<string, unknown>) : {};

  return Object.fromEntries(
    fallbackEntries.map(([key, fallbackValue]) => [key, mergeTranslations(primaryRecord[key], fallbackValue)])
  );
};

type LocaleDictionary = LocaleDictionaries[typeof defaultLang];

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in sourceLocales) return lang as keyof LocaleDictionaries;
  return defaultLang;
}

export function useTranslations(lang: keyof LocaleDictionaries) {
  return mergeTranslations(sourceLocales[lang], sourceLocales[defaultLang]) as LocaleDictionary;
}
