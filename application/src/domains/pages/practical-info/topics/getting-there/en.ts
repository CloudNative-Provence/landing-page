import { eventMeta, getEventPlace, getVenueInfo } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';
import { getLocalizedPagePath } from '~/i18n/routes';

const venuePlace = getEventPlace('en');
const venueInfo = getVenueInfo('en');
const hasVenue = venuePlace.trim().length > 0;
const arrivalDestinationLabel = hasVenue ? `to ${venuePlace} or the city center` : `to ${eventMeta.city} city center`;
const venueAddress = venueInfo.address;
const venueDescription = venueInfo.description;
const venueMapEmbedUrl = venueAddress
  ? `https://www.google.com/maps?q=${encodeURIComponent(venueAddress)}&output=embed`
  : undefined;
const venueMapHref =
  venueInfo.mapUrl ?? (venueAddress ? `https://www.google.com/maps?q=${encodeURIComponent(venueAddress)}` : undefined);

const transportResources = {
  officialGuide: 'https://www.aixenprovencetourism.com/en/access-transport/',
  maps: 'https://www.aixenprovencetourism.com/en/plan-your-trip/aix-maps/',
  publicTransport: 'https://www.aixenprovencetourism.com/en/access-transport/public-transport-networks/',
  taxis: 'https://www.aixenprovencetourism.com/en/access-transport/taxis-aixenprovence/',
  parkAndRide: 'https://www.aixenprovencetourism.com/en/access-transport/park-and-ride-car-parks/',
  railBooking: 'https://www.sncf-connect.com/en-en/',
  localTransit: 'https://www.lametropolemobilite.fr/',
  airport: 'https://www.marseille.aeroport.fr/',
} as const;

export default {
  metadata: {
    title: 'Getting There',
    description: `Plan your trip to ${eventMeta.city} by car, train, or plane for the event day.`,
  },
  tagline: 'Practical information',
  title: 'Getting there',
  summary: `Choose your arrival hub first, then plan the final 15 to 30 minutes ${arrivalDestinationLabel}.`,
  content: `<p>If you are arriving on the event morning, prefer the option with the fewest transfers and leave buffer time for commuter traffic on the A8 corridor.</p><p>For hotels in the historic center, the final stretch is often easiest on foot or by taxi once you have dropped luggage.</p>`,
  icon: 'tabler:route',
  callToActionLabel: 'See travel options',
  backToOverviewLabel: 'Back to practical information',
  travelGuide: {
    heroTitle: 'Plan the smoothest way in',
    heroIntro:
      'Pick the arrival flow that reduces unnecessary transfers, then reserve the short final segment with enough time buffer.',
    factsTitle: 'At a glance',
    facts: [
      {
        label: 'Aix-en-Provence TGV',
        value: 'Around 15 minutes from the city center',
        icon: 'tabler:train',
      },
      {
        label: 'Marseille Provence Airport',
        value: 'Around 25 minutes from the city center',
        icon: 'tabler:plane-arrival',
      },
      {
        label: 'Road access',
        value: 'Direct via the A7, A8, and A51 corridors',
        icon: 'tabler:road',
      },
      {
        label: 'Last-mile transfer',
        value: `Plan the final short trip ${arrivalDestinationLabel}`,
        icon: 'tabler:map-pin-share',
      },
    ],
    locationTitle: 'Venue address',
    locationAddress: venueAddress,
    locationDescription: venueDescription,
    locationMapTitle: `${venuePlace} map`,
    locationMapEmbedUrl: venueMapEmbedUrl,
    locationMapHref: venueMapHref,
    locationMapLinkLabel: 'Open in Google Maps',
    plannerTitle: 'Travel planner',
    plannerIntro: `Choose the route that fits your arrival style, then focus on the final transfer into ${eventMeta.city}.`,
    selectorTitle: 'Select your arrival mode',
    selectorIntro:
      'Compare the fastest path, the most flexible option, and the least stressful route for luggage before you book.',
    routeTitle: 'Route at a glance',
    routeLabel: 'Arrival flow',
    checklistTitle: 'Departure checklist',
    linksTitle: 'Useful links for this option',
    modesTitle: 'Choose the transport mode that matches your trip',
    modesIntro:
      'Each option works well, but the best one depends on whether you optimize for speed, luggage, or flexibility.',
    modes: [
      {
        title: 'By train',
        badge: 'Best from Paris, Lyon, Brussels, or Geneva',
        duration: 'About 2h55 from Paris',
        summary: `Aix-en-Provence TGV is the fastest long-distance rail hub and sits about 15 km from central ${eventMeta.city}.`,
        icon: 'tabler:train',
        route: [
          {
            title: 'Book a TGV arrival',
            detail: 'Choose a same-day train only if the last local transfer still leaves you comfortable margin.',
            icon: 'tabler:ticket',
          },
          {
            title: 'Arrive at Aix-en-Provence TGV',
            detail: 'Expect a short transfer onward by shuttle, taxi, or rental car.',
            icon: 'tabler:train',
          },
          {
            title: 'Complete the last-mile trip',
            detail: hasVenue
              ? `Head toward ${venuePlace} or your city-center hotel with the simplest luggage-friendly option.`
              : 'Head toward the city center with the simplest luggage-friendly option.',
            icon: 'tabler:map-route',
          },
        ],
        details: [
          'Direct or easy-connection TGV routes make this the most predictable option for same-day arrivals.',
          'From the station, continue by shuttle, taxi, or rental car depending on where you stay.',
          'Check the last local connection before locking in an early or late train.',
        ],
        links: [
          { text: 'Official access guide', href: transportResources.officialGuide },
          { text: 'Book rail tickets', href: transportResources.railBooking },
          { text: 'Local transit options', href: transportResources.localTransit },
        ],
      },
      {
        title: 'By plane',
        badge: 'Best for international and multi-city trips',
        duration: 'About 25 minutes to Aix',
        summary:
          'Marseille Provence Airport is the closest airport and the most flexible option if you need broad flight choices.',
        icon: 'tabler:plane-arrival',
        route: [
          {
            title: 'Land at Marseille Provence Airport',
            detail: 'Add time for baggage claim and terminal exit before planning the road leg.',
            icon: 'tabler:plane-arrival',
          },
          {
            title: 'Choose a direct onward transfer',
            detail: 'Taxi or pre-booked car is usually the least stressful option with bags or late arrivals.',
            icon: 'tabler:car',
          },
          {
            title: 'Reach the venue area or hotel',
            detail: 'If you arrive the night before, compare airport-area and city-center handoff times first.',
            icon: 'tabler:building-community',
          },
        ],
        details: [
          'Allow extra time for baggage claim and the road transfer into Aix-en-Provence.',
          'Taxis and pre-booked rides are the most direct option when carrying luggage or arriving outside peak shuttle windows.',
          'If you land the night before, compare airport-area and city-center hotel transfer times before booking.',
        ],
        links: [
          { text: 'Airport website', href: transportResources.airport },
          { text: 'Official access guide', href: transportResources.officialGuide },
          { text: 'Taxi information', href: transportResources.taxis },
        ],
      },
      {
        title: 'By car',
        badge: 'Best if you continue across Provence',
        duration: 'Direct via A7, A8, and A51',
        summary:
          'Driving gives you the most flexibility, especially if you plan extra meetings or a stay elsewhere in Provence.',
        icon: 'tabler:car',
        route: [
          {
            title: 'Plan the motorway approach',
            detail: 'Use the A7, A8, or A51 corridor that avoids unnecessary backtracking on arrival day.',
            icon: 'tabler:road',
          },
          {
            title: 'Decide parking before departure',
            detail: 'Choose between central parking and a park-and-ride strategy before you leave.',
            icon: 'tabler:parking',
          },
          {
            title: 'Finish the trip on foot or local transit',
            detail: 'The final stretch is often easier without moving the car again once parked.',
            icon: 'tabler:walk',
          },
        ],
        details: [
          'Morning traffic can slow the final approach, so build margin if you drive in on the event day.',
          'Historic-center parking is more constrained than park-and-ride or peripheral options.',
          'If you do not need the car during the day, park once and finish the last stretch on foot or local transit.',
        ],
        links: [
          { text: 'Official access guide', href: transportResources.officialGuide },
          { text: 'Park-and-ride options', href: transportResources.parkAndRide },
          {
            text: 'Local parking guide',
            href: 'https://www.aixenprovencetourism.com/en/access-transport/car-parks-in-aix-en-provence/',
          },
        ],
      },
      {
        title: 'Local transfers',
        badge: 'Best for the final 10 to 30 minutes',
        duration: `After you arrive in ${eventMeta.city}`,
        summary: hasVenue
          ? `For the final connection to ${venuePlace} or the city center, combine local transit, taxi, or a short walk based on your luggage and schedule.`
          : 'For the final connection to the city center, combine local transit, taxi, or a short walk based on your luggage and schedule.',
        icon: 'tabler:bus',
        route: [
          {
            title: 'Arrive at your main hub',
            detail: 'Start from the TGV station, airport, hotel, or central parking depending on your trip.',
            icon: 'tabler:current-location',
          },
          {
            title: 'Pick the least-friction transfer',
            detail: 'Choose between bus, taxi, or a short walk based on timing and luggage.',
            icon: 'tabler:bus',
          },
          {
            title: 'Walk the final segment confidently',
            detail: 'Keep maps and venue details handy for the last few blocks.',
            icon: 'tabler:map-pin',
          },
        ],
        details: [
          'La Métropole Mobilité and the tourism office guide cover public transport options across the city.',
          'Taxis are useful for tight schedules, heavy bags, or direct access to the venue area.',
          'If your hotel is central, walking the last segment is often easier than dealing with city-center traffic.',
        ],
        links: [
          { text: 'Public transport networks', href: transportResources.publicTransport },
          { text: 'Taxi listings', href: transportResources.taxis },
          { text: 'City maps', href: transportResources.maps },
        ],
      },
    ],
    tipsTitle: 'Before you leave',
    tips: [
      'Confirm the last shuttle or local transfer if you arrive very early or late in the day.',
      {
        text: 'If you stay in the center, avoid planning a final car segment unless your hotel provides ',
        link: { text: 'parking', href: getLocalizedPagePath('en', 'practical-info', 'parking') },
        textAfter: '.',
      },
      'Keep one navigation app and one official transport source handy for last-minute platform or traffic changes.',
    ],
    resourcesTitle: 'Official resources',
    notesTitle: 'Arrival notes',
    resources: [
      { text: 'Venue website', href: venueInfo.url ?? 'https://www.aixenprovence-congres.com/en/' },
      ...(venueMapHref ? [{ text: 'Venue on Google Maps', href: venueMapHref }] : []),
      {
        text: 'Access details',
        href:
          venueInfo.accessUrl ?? 'https://www.aixenprovence-congres.com/en/aix-en-provence-convention-centre/access/',
      },
      { text: 'Aix-en-Provence official transport guide', href: transportResources.officialGuide },
      { text: 'Aix maps', href: transportResources.maps },
      { text: 'La Métropole Mobilité', href: transportResources.localTransit },
      { text: 'SNCF Connect', href: transportResources.railBooking },
    ],
  },
} satisfies PracticalInfoTopicData;
