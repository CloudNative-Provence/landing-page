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
    title: 'Parkings',
    description: `Consultez les solutions de stationnement et parking-relais pour votre venue à ${eventMeta.city}.`,
  },
  tagline: 'Infos pratiques',
  title: 'Parkings',
  summary:
    'Stationnez sous le lieu, dans un parking central, ou laissez la voiture dans un parking-relais et prenez un bus gratuit.',
  content:
    'Vous venez en voiture ? Le parking Carnot se trouve juste sous le centre des congrès, plusieurs parkings couverts sont à quelques minutes à pied, et les parkings-relais aux entrées de la ville offrent un bus gratuit vers le centre.',
  icon: 'tabler:parking',
  callToActionLabel: 'Voir les parkings',
  backToOverviewLabel: 'Retour aux infos pratiques',
  parkingGuide: {
    heroTitle: "Où se garer pour l'événement",
    heroIntro:
      'Venez en voiture sans stress : garez-vous juste sous le lieu, dans un parking central, ou laissez la voiture dans un parking-relais et montez dans un bus gratuit.',
    categoriesTitle: 'Choisissez votre approche',
    categoriesIntro: "Trois options selon la proximité souhaitée et l'organisation de votre journée.",
    categories: [
      {
        id: 'venue',
        title: 'Au plus près du lieu',
        badge: 'Sous le centre des congrès',
        description: "Le parking Carnot se trouve juste sous le lieu - l'option la plus simple le jour J.",
        icon: 'tabler:building',
        options: [
          {
            name: 'Parking Carnot',
            blurb:
              'Juste sous le centre des congrès, à un ascenseur des salles ; 675 places avec recharge électrique, personnel 24h/24.',
            address: 'Boulevard Carnot, 13100 Aix-en-Provence',
            featureTags: ['Couvert', 'Recharge électrique', 'Ouvert 24h/24', 'Accès PMR'],
            mapLabel: 'Carte',
            mapHref: mapsPin('43.525315', '5.454859'),
          },
        ],
      },
      {
        id: 'city-centre',
        title: 'Parkings du centre-ville',
        badge: 'À quelques minutes à pied',
        description: 'Parkings publics couverts à quelques minutes à pied, pratiques si Carnot est complete.',
        icon: 'tabler:parking',
        options: [
          {
            name: 'Parking Rotonde',
            blurb:
              'Le plus grand parking central (1 800 places) près de La Rotonde et des gares, avec recharge électrique.',
            address: 'Rue Villevieille, 13100 Aix-en-Provence',
            featureTags: ['Couvert', 'Recharge électrique', 'Ouvert 24h/24'],
            mapLabel: 'Carte',
            mapHref: mapsPin('43.526953', '5.443108'),
          },
          {
            name: 'Parking Mignet',
            blurb: 'Parking souterrain central près du Palais de Justice, à deux pas du cours Mirabeau.',
            address: 'Rue Mignet, 13100 Aix-en-Provence',
            featureTags: ['Couvert', 'Central'],
            mapLabel: 'Carte',
            mapHref: mapsSearch('Parking Mignet, Aix-en-Provence'),
          },
          {
            name: 'Parking Pasteur',
            blurb: 'Pratique pour le nord de la vieille ville et le quartier des Thermes.',
            address: 'Avenue Pasteur, 13100 Aix-en-Provence',
            featureTags: ['Couvert', 'Central'],
            mapLabel: 'Carte',
            mapHref: mapsSearch('Parking Pasteur, Aix-en-Provence'),
          },
        ],
      },
      {
        id: 'park-and-ride',
        title: 'Parkings-relais (P+R)',
        badge: 'Bus gratuit vers le centre',
        description:
          "Parkings sécurisés et gardiennés aux entrées de la ville, reliés au centre par des bus fréquents - gratuits pour le conducteur et ses passagers sur demande à l'accueil. Ouverts de 4h30 à 20h, sortie à toute heure.",
        icon: 'tabler:bus',
        options: [
          {
            name: 'P+R Krypton',
            blurb: 'Côté ouest, au Jas de Bouffan, avec une ligne de bus fréquente vers le centre.',
            address: 'Jas de Bouffan, 13090 Aix-en-Provence',
            featureTags: ['Sécurisé', 'Bus gratuit vers le centre'],
            mapLabel: 'Carte',
            mapHref: mapsSearch('Parking relais Krypton, Aix-en-Provence'),
          },
          {
            name: 'P+R Malacrida',
            blurb: 'Côté est, près de la rocade, avec un bus direct vers le centre.',
            address: 'Avenue Henri Malacrida, 13100 Aix-en-Provence',
            featureTags: ['Sécurisé', 'Bus gratuit vers le centre'],
            mapLabel: 'Carte',
            mapHref: mapsSearch('Parking relais Malacrida, Aix-en-Provence'),
          },
          {
            name: 'P+R Route des Alpes',
            blurb: 'Entrée nord de la ville, avec une ligne de bus vers le centre.',
            address: 'Route des Alpes, 13100 Aix-en-Provence',
            featureTags: ['Sécurisé', 'Bus gratuit vers le centre'],
            mapLabel: 'Carte',
            mapHref: mapsSearch('Parking relais Route des Alpes, Aix-en-Provence'),
          },
        ],
      },
    ],
    tipsTitle: 'Avant de prendre la voiture',
    tips: [
      "Le jour J, le parking Carnot sous le centre des congrès est l'option la plus simple.",
      'Les 30 premières minutes sont gratuites dans les parkings du centre (SEMEPA).',
      "Vous venez à la journée ? Laissez la voiture dans un parking-relais et demandez à l'accueil le ticket de bus gratuit pour vous et vos passagers.",
      "Les parkings du centre sont pris d'assaut les jours de marché (mardi, jeudi, samedi) - arrivez tôt.",
      'La plupart des parkings couverts ont une hauteur limitée à 1,90 m.',
    ],
    resourcesTitle: 'Liens utiles',
    resources: [
      { text: 'Offre parking-relais (La Métropole Mobilité)', href: parkingResources.parkAndRideOffer },
      { text: 'Liste officielle des parkings', href: parkingResources.officialList },
      { text: 'Parkings du centre-ville (infos en direct)', href: parkingResources.cityCarParks },
      { text: 'Parkings-relais : lignes et tarifs', href: parkingResources.parkAndRideLines },
    ],
    notesTitle: 'Bon à savoir',
    notes: [
      'Parking Carnot : 675 places, hauteur max 1,90 m, recharge électrique, personnel 24h/24.',
      "Parking Rotonde : 1 800 places, et le niveau -1 accueille les véhicules jusqu'à 3 m de haut.",
      'Les parkings-relais ouvrent à 4h30 et ferment à 20h ; la sortie est possible à toute heure.',
    ],
  },
} satisfies PracticalInfoTopicData;
