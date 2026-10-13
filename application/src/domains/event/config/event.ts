import { EVENT } from 'astrowind:config';
import {
  buildCfpImportantDates,
  buildCfpStatuses,
  cfpSchedule,
  cfpSubmissionUrl,
  isCfpOpen,
} from '~/domains/event/cfp/presentation';
import { type CarpoolingInfo, getCarpoolingInfo, hasCarpooling } from './carpooling';
import {
  composeVenueLabel,
  composeVenueName,
  type EventLocale,
  getEventPlace,
  getVenueInfo,
  getVenueLabel,
  getVenueName,
  resolveLocalizedVenuePlace,
  type VenueInfo,
} from './venue';

export {
  buildCfpImportantDates,
  buildCfpStatuses,
  type CarpoolingInfo,
  cfpSchedule,
  cfpSubmissionUrl,
  composeVenueLabel,
  composeVenueName,
  type EventLocale,
  getCarpoolingInfo,
  getEventPlace,
  getVenueInfo,
  getVenueLabel,
  getVenueName,
  hasCarpooling,
  isCfpOpen,
  resolveLocalizedVenuePlace,
  type VenueInfo,
};

export const eventMeta = {
  startsAt: EVENT.startsAt,
  timeZone: EVENT.timeZone,
  city: EVENT.city,
  place: getEventPlace('fr'),
  venueName: getVenueName('fr'),
  venueLabel: getVenueLabel('fr'),
  venueUrl: getVenueInfo('fr').url,
  venueAccessUrl: getVenueInfo('fr').accessUrl,
  venueAddress: getVenueInfo('fr').address,
  venueMapUrl: getVenueInfo('fr').mapUrl,
} as const;

export const formatEventDate = (locale: EventLocale): string => {
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US';

  return new Intl.DateTimeFormat(localeCode, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: eventMeta.timeZone,
  }).format(new Date(eventMeta.startsAt));
};
