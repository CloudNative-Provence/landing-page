import type { AppLang } from '~/i18n/routes';
import { venueInterfaceEn } from './en';
import { venueInterfaceFr } from './fr';

export interface VenueInterface {
  readonly title: string;
  readonly subtitle: string;
  readonly mapLabel: string;
  readonly rooms: string;
  readonly program: string;
  readonly agenda: string;
  readonly plannedSession: string;
  readonly startingSoon: string;
  readonly nextSaved: string;
  readonly savedAgenda: string;
  readonly emptySaved: string;
  readonly saved: string;
  readonly save: string;
  readonly remove: string;
  readonly current: string;
  readonly next: string;
  readonly past: string;
  readonly noCurrent: string;
  readonly allSessions: string;
  readonly noSessions: string;
  readonly programUnavailable: string;
  readonly globalSession: string;
  readonly mainRoom: string;
  readonly broadcastRoom: string;
  readonly close: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly reset: string;
  readonly fullscreen: string;
  readonly exitFullscreen: string;
  readonly interact: string;
  readonly stopInteract: string;
  readonly loading: string;
  readonly fallback: string;
  readonly roomSelected: string;
  readonly liveNote: string;
  readonly firstFloor: string;
  readonly viewAccess: string;
  readonly viewAmphitheatre: string;
  readonly roomNames: Readonly<Record<string, string>>;
  readonly roomDetails: Readonly<Record<string, string>>;
}

export const venueInterface: Readonly<Record<AppLang, VenueInterface>> = {
  fr: venueInterfaceFr,
  en: venueInterfaceEn,
};
