import { eventMeta } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';

const parkingResources = {
  parkAndRideOffer: 'https://www.lametropolemobilite.fr/parking-relais/#loffre-parking-relais-pr-a-aix-en-provence',
  officialList: 'https://www.aixenprovencetourism.com/acces-transports/parkings/',
  cityCarParks: 'https://mamp.parkings-semepa.fr/',
  parkAndRideLines: 'https://www.aixenbus.fr/fr/Yve-Les-Parkings-Relais-28P2BR29.html',
} as const;

const mapsPin = (lat: string, lon: string) => `https://www.google.com/maps?q=${lat},${lon}`;
const mapsSearch = (query: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export default {
  metadata: {
    title: 'Parking',
    description: `Find parking and park-and-ride options for your visit to ${eventMeta.city}.`,
  },
  tagline: 'Practical information',
  title: 'Parking',
  summary: 'Park under the venue, in a central car park, or leave the car at a park-and-ride and ride a free bus in.',
  content:
    'Coming by car? Parking Carnot sits directly under the congress centre, several covered car parks are a short walk away, and park-and-ride sites at the city entrances offer a free bus into the centre.',
  icon: 'tabler:parking',
  callToActionLabel: 'See parking options',
  backToOverviewLabel: 'Back to practical information',
  parkingGuide: {
    heroTitle: 'Where to park for the event',
    heroIntro:
      'Come by car with less stress: park right under the venue, in a central car park, or leave the car at a park-and-ride and hop on a free bus.',
    categoriesTitle: 'Choose your parking approach',
    categoriesIntro: 'Three options depending on how close you want to be and how you plan your day.',
    categories: [
      {
        id: 'venue',
        title: 'Closest to the venue',
        badge: 'Under the congress centre',
        description: 'Parking Carnot sits directly beneath the venue - the simplest choice on the day.',
        icon: 'tabler:building',
        options: [
          {
            name: 'Parking Carnot',
            blurb:
              'Right under the congress centre, a lift ride from the halls; 675 spaces with EV charging, staffed around the clock.',
            address: 'Boulevard Carnot, 13100 Aix-en-Provence',
            featureTags: ['Covered', 'EV charging', 'Open 24/7', 'Wheelchair access'],
            mapLabel: 'Map',
            mapHref: mapsPin('43.525315', '5.454859'),
          },
        ],
      },
      {
        id: 'city-centre',
        title: 'City-centre car parks',
        badge: 'A short walk to the venue',
        description: "Covered public car parks a few minutes' walk away, handy if Carnot is full.",
        icon: 'tabler:parking',
        options: [
          {
            name: 'Parking Rotonde',
            blurb: 'The largest central car park (1,800 spaces) by La Rotonde and the stations, with EV charging.',
            address: 'Rue Villevieille, 13100 Aix-en-Provence',
            featureTags: ['Covered', 'EV charging', 'Open 24/7'],
            mapLabel: 'Map',
            mapHref: mapsPin('43.526953', '5.443108'),
          },
          {
            name: 'Parking Mignet',
            blurb: 'Central underground car park by the Palais de Justice, steps from cours Mirabeau.',
            address: 'Rue Mignet, 13100 Aix-en-Provence',
            featureTags: ['Covered', 'Central'],
            mapLabel: 'Map',
            mapHref: mapsSearch('Parking Mignet, Aix-en-Provence'),
          },
          {
            name: 'Parking Pasteur',
            blurb: 'Handy for the north of the old town and the Thermes district.',
            address: 'Avenue Pasteur, 13100 Aix-en-Provence',
            featureTags: ['Covered', 'Central'],
            mapLabel: 'Map',
            mapHref: mapsSearch('Parking Pasteur, Aix-en-Provence'),
          },
        ],
      },
      {
        id: 'park-and-ride',
        title: 'Park-and-ride (P+R)',
        badge: 'Free bus to the centre',
        description:
          'Secured, guarded car parks at the city entrances, linked to the centre by frequent buses - free for the driver and passengers when you ask at the desk. Open 4:30am to 8pm, exit any time.',
        icon: 'tabler:bus',
        options: [
          {
            name: 'P+R Krypton',
            blurb: 'West side, by the Jas de Bouffan, with a frequent bus line into the centre.',
            address: 'Jas de Bouffan, 13090 Aix-en-Provence',
            featureTags: ['Secured', 'Free bus to centre'],
            mapLabel: 'Map',
            mapHref: mapsSearch('Parking relais Krypton, Aix-en-Provence'),
          },
          {
            name: 'P+R Malacrida',
            blurb: 'East side, near the ring road, with a direct bus to the centre.',
            address: 'Avenue Henri Malacrida, 13100 Aix-en-Provence',
            featureTags: ['Secured', 'Free bus to centre'],
            mapLabel: 'Map',
            mapHref: mapsSearch('Parking relais Malacrida, Aix-en-Provence'),
          },
          {
            name: 'P+R Route des Alpes',
            blurb: 'North entrance of the city, with a bus line to the centre.',
            address: 'Route des Alpes, 13100 Aix-en-Provence',
            featureTags: ['Secured', 'Free bus to centre'],
            mapLabel: 'Map',
            mapHref: mapsSearch('Parking relais Route des Alpes, Aix-en-Provence'),
          },
        ],
      },
    ],
    tipsTitle: 'Before you drive',
    tips: [
      'On the day, Parking Carnot under the congress centre is the easiest option.',
      'The first 30 minutes are free in the city-centre (SEMEPA) car parks.',
      'Driving in for the day? Leave the car at a park-and-ride and ask at the desk for the free bus ticket for you and your passengers.',
      'Central car parks get busy on market days (Tuesday, Thursday, Saturday) - arrive early.',
      'Most covered car parks have a 1.90 m height limit.',
    ],
    resourcesTitle: 'Useful links',
    resources: [
      { text: 'Park-and-ride offer (La Metropole Mobilite)', href: parkingResources.parkAndRideOffer },
      { text: 'Official parking list', href: parkingResources.officialList },
      { text: 'City-centre car parks (live info)', href: parkingResources.cityCarParks },
      { text: 'Park-and-ride lines & fares', href: parkingResources.parkAndRideLines },
    ],
    notesTitle: 'Good to know',
    notes: [
      'Parking Carnot: 675 spaces, max height 1.90 m, EV charging, staffed 24/7.',
      'Parking Rotonde: 1,800 spaces, and level -1 takes vehicles up to 3 m high.',
      'Park-and-ride sites open at 4:30am and close at 8pm; you can exit at any time.',
    ],
  },
} satisfies PracticalInfoTopicData;
