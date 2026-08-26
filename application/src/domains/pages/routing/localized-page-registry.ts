import type { AstroComponentFactory } from 'astro/runtime/server/index.js';
import aboutEn from '~/domains/pages/about/en';
import aboutFr from '~/domains/pages/about/fr';
import { enContent as brandEnContent } from '~/domains/pages/brand-guidelines/en';
import { frContent as brandFrContent } from '~/domains/pages/brand-guidelines/fr';
import contactEn from '~/domains/pages/contact/en';
import contactFr from '~/domains/pages/contact/fr';
import practicalInfoEn from '~/domains/pages/practical-info/content/en';
import practicalInfoFr from '~/domains/pages/practical-info/content/fr';
import privacyEn from '~/domains/pages/privacy/en';
import privacyFr from '~/domains/pages/privacy/fr';
import { programEnPageData, programFrPageData } from '~/domains/pages/program/services/page-data';
import sponsoringEn from '~/domains/pages/sponsoring/en';
import sponsoringFr from '~/domains/pages/sponsoring/fr';
import termsEn from '~/domains/pages/terms/en';
import termsFr from '~/domains/pages/terms/fr';
import type { AppLang, RouteKey } from '~/i18n/routes';
import AboutContent from '~/pages/about/_content.astro';
import BrandGuidelinesContent from '~/pages/brand-guidelines/_content.astro';
import ContactContent from '~/pages/contact/_content.astro';
import PracticalInfoContent from '~/pages/practical-info/_content.astro';
import PrivacyContent from '~/pages/privacy/_content.astro';
import ProgramContent from '~/pages/program/_content.astro';
import SponsoringContent from '~/pages/sponsoring/_content.astro';
import TermsContent from '~/pages/terms/_content.astro';
import type { MetaData } from '~/types';

type LocalizedPageData = {
  metadata: MetaData;
} & Record<string, unknown>;

export interface LocalizedPageDefinition {
  component: AstroComponentFactory;
  layout: 'page' | 'standalone';
  metadata: MetaData;
  props: Record<string, unknown>;
}

type LocalizedPageResolver = (lang: AppLang) => LocalizedPageDefinition;

const selectLocalizedData = <TData>(lang: AppLang, variants: { en: TData; fr: TData }): TData =>
  lang === 'en' ? variants.en : variants.fr;

const createPageResolver = (
  component: AstroComponentFactory,
  variants: { en: LocalizedPageData; fr: LocalizedPageData },
  layout: LocalizedPageDefinition['layout'] = 'page'
): LocalizedPageResolver => {
  return (lang) => {
    const { metadata, ...props } = selectLocalizedData(lang, variants);

    return {
      component,
      layout,
      metadata,
      props,
    };
  };
};

const localizedPageResolvers = {
  about: createPageResolver(AboutContent, { en: aboutEn, fr: aboutFr }),
  contact: createPageResolver(ContactContent, { en: contactEn, fr: contactFr }),
  'practical-info': createPageResolver(PracticalInfoContent, { en: practicalInfoEn, fr: practicalInfoFr }),
  program: createPageResolver(ProgramContent, { en: programEnPageData, fr: programFrPageData }),
  sponsoring: createPageResolver(SponsoringContent, { en: sponsoringEn, fr: sponsoringFr }),
  'brand-guidelines': createPageResolver(
    BrandGuidelinesContent,
    { en: brandEnContent, fr: brandFrContent },
    'standalone'
  ),
  terms: createPageResolver(TermsContent, { en: termsEn, fr: termsFr }),
  privacy: createPageResolver(PrivacyContent, { en: privacyEn, fr: privacyFr }),
} satisfies Record<RouteKey, LocalizedPageResolver>;

export class LocalizedPageRegistry {
  static resolve(routeKey: RouteKey, lang: AppLang): LocalizedPageDefinition {
    return localizedPageResolvers[routeKey](lang);
  }

  static getRouteKeys(): RouteKey[] {
    return Object.keys(localizedPageResolvers) as RouteKey[];
  }
}
