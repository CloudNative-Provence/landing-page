import { APP_PROGRAM } from 'astrowind:config';

import { type RouteKey, routeSlugs } from '~/i18n/routes';

export const isProgramEnabled = () => APP_PROGRAM.isEnabled;

const isProgramPage = (routeKey: RouteKey) => routeKey === 'program' || routeKey === 'speakers';

export const isLocalizedPageEnabled = (routeKey: RouteKey) => !isProgramPage(routeKey) || isProgramEnabled();

export const hasStandaloneLocalizedPage = (routeKey: RouteKey) => routeKey !== 'practical-info';

export const getEnabledLocalizedRouteKeys = () =>
  (Object.keys(routeSlugs) as RouteKey[]).filter((routeKey) => isLocalizedPageEnabled(routeKey));

export const getEnabledStandaloneLocalizedRouteKeys = () =>
  getEnabledLocalizedRouteKeys().filter(hasStandaloneLocalizedPage);
