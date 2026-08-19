import { eventMeta } from '~/data/meta/event';

const hasVenue = eventMeta.place.trim().length > 0;
const venueAreaLabel = hasVenue ? `${eventMeta.place} et le centre-ville` : `le centre-ville d'${eventMeta.city}`;

export default {
  metadata: {
    title: 'Infos pratiques',
    description: `Préparez votre venue à ${eventMeta.city} : hébergement, accès, activités et parkings pour le jour de l'événement.`,
  },
  tagline: 'Avant votre venue',
  title: 'Les infos pratiques pour votre journée en Provence',
  featuresTitle: 'Tout pour organiser votre venue',
  items: [
    {
      title: 'Hébergement',
      description: `${eventMeta.city} propose des hôtels, appart-hôtels, maisons d'hôtes et locations courte durée à proximité de ${venueAreaLabel}. Nous vous conseillons de réserver tôt si vous souhaitez loger près du lieu ou dans le centre-ville.`,
      icon: 'tabler:bed',
    },
    {
      title: 'Comment venir',
      description:
        "En voiture : accès via l'autoroute A8.<br />En train : la gare Aix-en-Provence TGV se situe à environ 15 minutes en navette ou taxi.<br />En avion : l'aéroport Marseille Provence est à environ 30 minutes.",
      icon: 'tabler:route',
    },
    {
      title: 'Activités',
      description:
        "Si vous prolongez votre séjour, profitez du centre historique d'Aix-en-Provence, de ses marchés et de ses terrasses, ou découvrez les incontournables de Provence comme la Sainte-Victoire et les villages alentour.",
      icon: 'tabler:map-star',
    },
    {
      title: 'Parkings',
      description:
        "Plusieurs solutions de stationnement public sont disponibles autour du centre-ville et des grands axes d'accès. Si vous venez à la journée, privilégiez les parkings officiels ou les parkings-relais pour faciliter votre arrivée sur le lieu de l'événement.",
      icon: 'tabler:parking',
    },
  ],
} as const;
