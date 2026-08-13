import { describe, expect, it } from 'vitest';

import { getLocalizedPagePath, getRouteKeyFromSlug, type RouteKey, routeSlugs, translatePathToLang } from './routes';

describe('i18n routes helpers', () => {
  it('builds localized page path from route key', () => {
    expect(getLocalizedPagePath('fr', 'about')).toBe('/fr/a-propos');
    expect(getLocalizedPagePath('fr', 'program')).toBe('/fr/programme');
    expect(getLocalizedPagePath('en', 'privacy')).toBe('/en/privacy-policy');
  });

  it('resolves route key from slug with and without extra slashes', () => {
    expect(getRouteKeyFromSlug('fr', '/charte-graphique/')).toBe('brand-guidelines');
    expect(getRouteKeyFromSlug('en', 'program')).toBe('program');
    expect(getRouteKeyFromSlug('en', 'terms-of-service')).toBe('terms');
    expect(getRouteKeyFromSlug('en', 'unknown')).toBeUndefined();
  });

  it('translates localized route to target language', () => {
    expect(translatePathToLang('/fr/a-propos', 'en')).toBe('/en/about');
    expect(translatePathToLang('/fr/programme', 'en')).toBe('/en/program');
    expect(translatePathToLang('/en/privacy-policy', 'fr')).toBe('/fr/politique-de-confidentialite');
  });

  it('keeps extra path segments after translated slug', () => {
    expect(translatePathToLang('/fr/a-propos/speaker/jane-doe', 'en')).toBe('/en/about/speaker/jane-doe');
  });

  it('handles root and language-only paths', () => {
    expect(translatePathToLang('/', 'fr')).toBe('/fr');
    expect(translatePathToLang('/en', 'fr')).toBe('/fr');
  });

  it('falls back to language root when source locale is not supported', () => {
    expect(translatePathToLang('/es/algo', 'en')).toBe('/en');
  });

  it('keeps unknown slug as-is after changing locale prefix', () => {
    expect(translatePathToLang('/fr/inconnu/path', 'en')).toBe('/en/inconnu/path');
  });

  it('contains all expected route keys', () => {
    const routeKeys = Object.keys(routeSlugs) as RouteKey[];
    expect(routeKeys).toEqual(['about', 'contact', 'program', 'sponsoring', 'brand-guidelines', 'terms', 'privacy']);
  });
});
