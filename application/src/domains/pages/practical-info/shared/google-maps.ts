export const buildGoogleMapsSearchHref = (query: string): string => {
  const href = new URL('https://www.google.com/maps/search/');
  const normalizedQuery = query.trim();

  href.searchParams.set('api', '1');
  href.searchParams.set('query', normalizedQuery);

  return href.toString();
};

export const buildGoogleMapsDirectionsHref = (origin: string, destination: string): string => {
  const href = new URL('https://www.google.com/maps/dir/');

  href.searchParams.set('api', '1');
  href.searchParams.set('origin', origin.trim());
  href.searchParams.set('destination', destination.trim());

  return href.toString();
};

export const buildVenueReferenceMapHref = ({
  venueReference,
  destination,
  fallbackQuery,
}: {
  venueReference?: string;
  destination: string;
  fallbackQuery?: string;
}): string => {
  const normalizedVenueReference = venueReference?.trim();
  const normalizedDestination = destination.trim();
  const normalizedFallbackQuery = (fallbackQuery ?? normalizedDestination).trim();

  if (normalizedVenueReference && normalizedDestination) {
    return buildGoogleMapsDirectionsHref(normalizedVenueReference, normalizedDestination);
  }

  return buildGoogleMapsSearchHref(normalizedFallbackQuery || normalizedDestination);
};
