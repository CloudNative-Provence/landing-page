import { eventMeta } from '~/data/meta/event';

const hasVenue = eventMeta.place.trim().length > 0;
const venueAreaLabel = hasVenue ? `${eventMeta.place} and the city center` : `${eventMeta.city} city center`;

export default {
  metadata: {
    title: 'Practical Information',
    description: `Plan your visit to ${eventMeta.city}: accommodation, transport, activities, and parking for the event day.`,
  },
  tagline: 'Before you arrive',
  title: 'Practical information for your day in Provence',
  featuresTitle: 'Everything you need to plan your visit',
  items: [
    {
      title: 'Accommodation',
      description: `${eventMeta.city} offers hotels, aparthotels, guesthouses, and short-term rentals within easy reach of ${venueAreaLabel}. We recommend booking early if you want to stay close to the venue or in the city center.`,
      icon: 'tabler:bed',
    },
    {
      title: 'Getting there',
      description:
        'By car: access via the A8 motorway.<br />By train: Aix-en-Provence TGV station is around 15 minutes away by shuttle or taxi.<br />By plane: Marseille Provence Airport is around 30 minutes away.',
      icon: 'tabler:route',
    },
    {
      title: 'Activities',
      description:
        'If you are extending your stay, take time to enjoy the historic center of Aix-en-Provence, its markets and terraces, or discover Provence landmarks such as Sainte-Victoire and the surrounding hilltop villages.',
      icon: 'tabler:map-star',
    },
    {
      title: 'Parking',
      description:
        'Several public parking options are available around the city center and major access roads. If you are driving in for the day, prefer official parking lots or park-and-ride facilities to make access to the venue easier.',
      icon: 'tabler:parking',
    },
  ],
} as const;
