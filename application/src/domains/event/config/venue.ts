import { EVENT } from 'astrowind:config';

export type EventLocale = 'en' | 'fr';

export type VenueInfo = {
  name?: string;
  address?: string;
  description?: string;
  url?: string;
  accessUrl?: string;
  mapUrl?: string;
};

type LocalizedVenueConfig = {
  en?: VenueInfo;
  fr?: VenueInfo;
};

type ExtendedEventConfig = typeof EVENT & {
  place: string | LocalizedVenueConfig;
  placeFr?: string;
  venueUrl?: string;
  venueAccessUrl?: string;
  venueAddress?: string;
  venueDescription?: string;
  venueMapUrl?: string;
};

const extendedEventConfig = EVENT as ExtendedEventConfig;

export const resolveLocalizedVenuePlace = (
  place: string,
  locale: EventLocale,
  localizedOptions?: { fr?: string }
): string => {
  const normalizedPlace = place.trim();

  if (!normalizedPlace) {
    return '';
  }

  if (locale === 'fr') {
    const localizedFrenchPlace = localizedOptions?.fr?.trim();

    if (localizedFrenchPlace) {
      return localizedFrenchPlace;
    }
  }

  return normalizedPlace;
};

const isLocalizedVenueConfig = (value: unknown): value is LocalizedVenueConfig =>
  typeof value === 'object' && value !== null && ('en' in value || 'fr' in value);

const normalizeOptionalString = (value: string | undefined): string | undefined => {
  const normalizedValue = value?.trim();

  return normalizedValue ? normalizedValue : undefined;
};

const normalizeVenueInfo = (value?: VenueInfo): VenueInfo => ({
  name: normalizeOptionalString(value?.name),
  address: normalizeOptionalString(value?.address),
  description: normalizeOptionalString(value?.description),
  url: normalizeOptionalString(value?.url),
  accessUrl: normalizeOptionalString(value?.accessUrl),
  mapUrl: normalizeOptionalString(value?.mapUrl),
});

const getLegacyVenueInfo = (locale: EventLocale): VenueInfo => {
  const legacyPlace = typeof extendedEventConfig.place === 'string' ? extendedEventConfig.place : '';

  return {
    name: resolveLocalizedVenuePlace(legacyPlace, locale, { fr: extendedEventConfig.placeFr }),
    address: normalizeOptionalString(extendedEventConfig.venueAddress),
    description: normalizeOptionalString(extendedEventConfig.venueDescription),
    url: normalizeOptionalString(extendedEventConfig.venueUrl),
    accessUrl: normalizeOptionalString(extendedEventConfig.venueAccessUrl),
    mapUrl: normalizeOptionalString(extendedEventConfig.venueMapUrl),
  };
};

export const getVenueInfo = (locale: EventLocale): VenueInfo => {
  if (!isLocalizedVenueConfig(extendedEventConfig.place)) {
    return getLegacyVenueInfo(locale);
  }

  const localizedPlace =
    extendedEventConfig.place[locale] ??
    (locale === 'fr' ? extendedEventConfig.place.en : extendedEventConfig.place.fr) ??
    {};

  return normalizeVenueInfo(localizedPlace);
};

export const composeVenueName = (place: string, city: string): string => {
  const normalizedPlace = place.trim();
  const normalizedCity = city.trim();

  if (!normalizedPlace) {
    return normalizedCity;
  }

  return placeAlreadyContainsCity(normalizedPlace, normalizedCity)
    ? normalizedPlace
    : `${normalizedPlace}, ${normalizedCity}`;
};

export const composeVenueLabel = (place: string, city: string): string => {
  const normalizedPlace = place.trim();
  const normalizedCity = city.trim();

  if (!normalizedPlace) {
    return normalizedCity;
  }

  return placeAlreadyContainsCity(normalizedPlace, normalizedCity)
    ? normalizedPlace
    : `${normalizedPlace} · ${normalizedCity}`;
};

export const getEventPlace = (locale: EventLocale): string => getVenueInfo(locale).name ?? '';

export const getVenueName = (locale: EventLocale): string => composeVenueName(getEventPlace(locale), EVENT.city);

export const getVenueLabel = (locale: EventLocale): string => composeVenueLabel(getEventPlace(locale), EVENT.city);

function placeAlreadyContainsCity(place: string, city: string): boolean {
  return place.toLocaleLowerCase('fr-FR').includes(city.toLocaleLowerCase('fr-FR'));
}
