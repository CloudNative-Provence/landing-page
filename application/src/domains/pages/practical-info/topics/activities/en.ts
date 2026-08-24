import { eventMeta } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';

const tourism = {
  thingsToDo: 'https://www.aixenprovencetourism.com/en/things-to-do/',
  guidedTours: 'https://www.aixenprovencetourism.com/en/aix-en-provence-en/guided-tours-aixenprovence/',
  toursInProvence: 'https://www.aixenprovencetourism.com/en/destination/tours-in-provence/',
  booking: 'https://booking.aixenprovencetourism.com/',
  cityPass: 'https://www.aixenprovencetourism.com/en/tourist-pass/',
} as const;

export default {
  metadata: {
    title: 'Activities',
    description: `Discover what to do in and around ${eventMeta.city} during your stay.`,
  },
  tagline: 'Practical information',
  title: 'Activities',
  summary: "Ideas for extending your stay - Cezanne's Aix, Provence landscapes, and local food and wine.",
  content:
    'Staying a little longer? Explore the old town and its museums on foot, head out to Sainte-Victoire and the Provence villages, or taste the local rose and cuisine.',
  icon: 'tabler:map-star',
  callToActionLabel: 'Discover activities',
  backToOverviewLabel: 'Back to practical information',
  activitiesGuide: {
    heroTitle: 'Make the most of your stay',
    heroIntro:
      "From Cezanne's Aix to the vineyards, mountains and coast of Provence, here are ideas to extend your trip.",
    categoriesTitle: 'Pick your kind of day',
    categoriesIntro: 'Culture in town, nature around Aix, or a taste of Provence.',
    categories: [
      {
        id: 'in-aix',
        title: 'In Aix-en-Provence',
        badge: 'Culture & heritage',
        description: 'Explore the old town and its art on foot, all within a short walk of the venue.',
        icon: 'tabler:building-monument',
        options: [
          {
            name: 'Old town & cours Mirabeau',
            blurb: 'Wander the Mazarin quarter, cours Mirabeau and its fountains, cafes and hotels particuliers.',
            meta: 'Historic centre - on foot',
            tags: ['Free', 'Walkable'],
            linkLabel: 'Guided tours',
            linkHref: tourism.guidedTours,
          },
          {
            name: 'Cezanne sites',
            blurb: "Walk in the painter's footsteps at his studio, the family bastide and the Bibemus quarries.",
            meta: 'Atelier des Lauves, Jas de Bouffan, Bibemus',
            tags: ['Booking advised'],
            linkLabel: 'Cezanne sites',
            linkHref: 'https://www.cezanne-en-provence.com/',
          },
          {
            name: 'Musee Granet',
            blurb: 'From Cezanne to Giacometti and the Planque collection, in a former priory of the Mazarin quarter.',
            meta: 'Place Saint-Jean-de-Malte',
            tags: ['Museum'],
            linkLabel: 'Musee Granet',
            linkHref: 'https://www.museegranet-aixenprovence.fr/en/homepage',
          },
          {
            name: "Caumont Centre d'Art",
            blurb: 'Major art exhibitions in an elegant 18th-century mansion with French gardens and a cafe.',
            meta: '3 rue Joseph Cabassol - Mazarin',
            tags: ['Museum', 'Cafe'],
            linkLabel: "Caumont Centre d'Art",
            linkHref: 'https://www.caumont-centredart.com/en',
          },
          {
            name: 'Fondation Vasarely',
            blurb: "Victor Vasarely's dazzling op-art architecture on the edge of town, near the Jas de Bouffan.",
            meta: '1 avenue Marcel Pagnol - 10 min',
            tags: ['Museum', 'Architecture'],
            linkLabel: 'Fondation Vasarely',
            linkHref: 'https://www.fondationvasarely.org/',
          },
        ],
      },
      {
        id: 'nature',
        title: 'Nature & outdoors',
        badge: 'Around Aix',
        description: "Provence's landscapes are on the doorstep - mountains, coast and hilltop villages.",
        icon: 'tabler:mountain',
        options: [
          {
            name: 'Montagne Sainte-Victoire',
            blurb: "Cezanne's beloved limestone ridge, with marked trails and viewpoints over the countryside.",
            meta: '20 min by car - hiking',
            tags: ['Hiking', 'Nature'],
            linkLabel: 'Hiking ideas',
            linkHref: 'https://www.grandsitesaintevictoire.com/pratiquer/marcher-randonner/idees-de-randonnees/',
          },
          {
            name: 'Calanques & Cassis',
            blurb: 'Turquoise coves and white cliffs between Marseille and Cassis in the Calanques National Park.',
            meta: 'About 45 min - coast',
            tags: ['Nature', 'Sea'],
            linkLabel: 'Provence day trips',
            linkHref: tourism.toursInProvence,
          },
          {
            name: 'Luberon hilltop villages',
            blurb: 'Gordes, Roussillon and the ochre trails, with lavender fields in season.',
            meta: 'About 45-60 min - villages',
            tags: ['Villages', 'Scenery'],
            linkLabel: 'Provence day trips',
            linkHref: tourism.toursInProvence,
          },
        ],
      },
      {
        id: 'food-wine',
        title: 'Food & wine',
        badge: 'Taste Provence',
        description: 'Rose country and Provencal flavours, from market stalls to art-filled wine estates.',
        icon: 'tabler:glass-full',
        options: [
          {
            name: 'Chateau La Coste',
            blurb:
              'A biodynamic wine estate blending vineyards, contemporary art and star architecture, with restaurants.',
            meta: 'Le Puy-Sainte-Reparade - 20 min',
            tags: ['Wine', 'Art', 'Food'],
            linkLabel: 'Chateau La Coste',
            linkHref: 'https://chateau-la-coste.com/en/',
          },
          {
            name: "Coteaux d'Aix wine estates",
            blurb: "Rose and red from the Coteaux d'Aix-en-Provence appellation, with cellar-door tastings.",
            meta: 'Around Aix - tastings',
            tags: ['Wine'],
            linkLabel: 'Book a tasting',
            linkHref: tourism.booking,
          },
          {
            name: 'Provencal markets & gastronomy',
            blurb: "Local produce, olives, cheese and the almond calisson d'Aix at the open-air markets.",
            meta: 'Old town - Tue, Thu & Sat',
            tags: ['Free', 'Food'],
            linkLabel: "What's on",
            linkHref: tourism.thingsToDo,
          },
        ],
      },
    ],
    tipsTitle: 'Plan your days',
    tips: [
      "Staying an extra day? The Cezanne sites and Sainte-Victoire pair well for a painter's day out.",
      "Book Cezanne's Atelier des Lauves and Bibemus ahead - places are limited.",
      'Markets fill the old town on Tuesday, Thursday and Saturday mornings.',
      'The Aix City Pass bundles major sites, guided tours and the bus network.',
      'In summer, check Sainte-Victoire forest access rules before you set off.',
    ],
    resourcesTitle: 'Useful links',
    resources: [
      { text: 'Things to do (tourist office)', href: tourism.thingsToDo },
      { text: 'Guided tours', href: tourism.guidedTours },
      { text: 'Tours in Provence', href: tourism.toursInProvence },
      { text: 'Book an activity', href: tourism.booking },
      { text: 'Aix City Pass', href: tourism.cityPass },
    ],
    notesTitle: 'Good to know',
    notes: [
      'Musee Granet and Caumont are a short walk apart in the Mazarin quarter.',
      'Most museums close on Mondays; check opening hours before you go.',
      'A car helps for Sainte-Victoire, the Luberon and the coast; the city itself is best on foot.',
    ],
  },
} satisfies PracticalInfoTopicData;
