import { eventMeta, getEventPlace, getVenueInfo, getVenueName } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';
import { buildVenueReferenceMapHref } from '~/domains/pages/practical-info/shared/google-maps';
import { stayThumbnails } from './stay-thumbnail';

const venuePlace = getEventPlace('fr');
const venueInfo = getVenueInfo('fr');
const hasVenue = venuePlace.trim().length > 0;
const accommodationAreaLabel = hasVenue
  ? `près du ${venuePlace} ou dans le centre-ville`
  : `près du centre-ville d'${eventMeta.city}`;
const accommodationResources = {
  tourismOffice: 'https://www.aixenprovencetourism.com/',
  maps: 'https://www.aixenprovencetourism.com/preparer-son-sejour/aix-plans/',
} as const;
const venueAddress = venueInfo.address;
const venueMapHref = venueInfo.mapUrl;
const venueMapReference = [getVenueName('fr'), venueAddress].filter(Boolean).join(', ');
const venueAreaTitle = hasVenue ? `Autour du ${venuePlace}` : 'Autour du lieu';
const mapsSearchContextLabel = hasVenue ? venuePlace : eventMeta.city;
const mapsSearchAnchor = [venuePlace, venueAddress ?? eventMeta.city].filter(Boolean).join(', ');
const mapsSearchBaseQuery = hasVenue ? `hébergement près de ${mapsSearchAnchor}` : `hébergement ${eventMeta.city}`;
const zoneSearchQueryById = {
  'venue-area': undefined,
  'near-stations': `gare SNCF gare routière ${eventMeta.city}`,
  'historic-center': `centre historique ${eventMeta.city}`,
} as const;

const mapsPin = (lat: string, lon: string) =>
  buildVenueReferenceMapHref({ venueReference: venueMapReference, destination: `${lat},${lon}` });

export default {
  metadata: {
    title: 'Hébergement',
    description: `Trouvez où loger à ${eventMeta.city} ${accommodationAreaLabel}.`,
  },
  tagline: 'Infos pratiques',
  title: 'Hébergement',
  summary: `Trouvez des hôtels, appart-hôtels, maisons d'hôtes et locations de courte durée ${accommodationAreaLabel}.`,
  content: `<p>Réservez tôt près du lieu de l'événement ou du centre historique pour avoir le plus de choix. Si vous prolongez votre séjour, ces deux zones sont idéales pour explorer la Provence.</p>`,
  icon: 'tabler:bed',
  callToActionLabel: "Voir les détails d'hébergement",
  backToOverviewLabel: 'Retour aux infos pratiques',
  accommodationGuide: {
    heroTitle: 'Où loger pour une journée sans stress',
    heroIntro:
      "Choisissez une zone selon votre mode d'arrivée et votre envie de marcher, puis le type d'hébergement adapté à votre séjour.",
    areasTitle: "Choisissez d'abord votre zone",
    areasIntro:
      'Trois options simples selon votre priorité : trajet le plus court, soirées animées ou arrivée tardive sans stress.',
    areas: [
      {
        title: venueAreaTitle,
        badge: 'Trajet le plus court le jour J',
        description: 'Un trajet simple le matin et un retour facile entre les sessions.',
        commute: 'Réservez tôt : cette zone se remplit en premier.',
      },
      {
        title: 'Centre historique',
        badge: 'Idéal pour les restaurants et les soirées',
        description:
          'Restaurants, cafés et balades à deux pas de votre hébergement, pour un séjour pratique sans voiture.',
        commute: "Un court trajet à pied ou en taxi jusqu'au lieu.",
      },
      {
        title: 'En lisière du centre',
        badge: 'Idéal pour les arrivées tardives',
        description: 'Accueil et stationnement plus simples si vous arrivez tard ou repartez tôt.',
        commute: 'Vérifiez le trajet du matin avant de réserver.',
      },
    ],
    stayTypesTitle: "Choisissez le type d'hébergement adapté",
    stayTypesIntro: 'Choisissez selon votre programme et les services dont vous avez besoin.',
    stayTypes: [
      {
        title: 'Hôtels',
        badge: 'Le plus simple',
        description: 'Services fiables, bagagerie et arrivée facile le jour même.',
        bestFor: 'Séjours courts ou en solo',
      },
      {
        title: 'Appart-hôtels',
        badge: "Plus d'espace",
        description: 'Une kitchenette et de la place pour plusieurs nuits.',
        bestFor: 'Équipes et longs séjours',
      },
      {
        title: "Maisons d'hôtes et locations",
        badge: 'Le plus local',
        description: "Plus de charme et de souplesse ; pensez à vérifier les conditions d'accès.",
        bestFor: 'Séjours prolongés ou en groupe',
      },
    ],
    stayFinder: {
      title: 'Trouvez votre hébergement',
      intro:
        "Affinez la sélection selon la zone, le type d'hébergement et vos critères pratiques, puis consultez le site ou la carte d'un établissement pour en savoir plus.",
      filters: [
        {
          id: 'zone',
          label: 'Zone',
          options: [
            { id: 'venue-area', label: 'Autour du lieu', searchQuery: zoneSearchQueryById['venue-area'] },
            { id: 'near-stations', label: 'Près des gares', searchQuery: zoneSearchQueryById['near-stations'] },
            { id: 'historic-center', label: 'Centre historique', searchQuery: zoneSearchQueryById['historic-center'] },
          ],
        },
        {
          id: 'type',
          label: 'Type',
          options: [
            { id: 'hotel', label: 'Hôtel', searchQuery: 'hotel' },
            { id: 'aparthotel', label: 'Appart-hôtel', searchQuery: 'appart hotel' },
            { id: 'guesthouse', label: "Maison d'hôtes", searchQuery: 'maison d hotes' },
          ],
        },
        {
          id: 'feature',
          label: 'Équipements',
          options: [{ id: 'parking', label: 'Parking', searchQuery: 'parking' }],
        },
        {
          id: 'coupon',
          label: 'Offres',
          options: [{ id: 'has-coupon', label: 'Avec code de réduction', searchQuery: undefined }],
        },
      ],
      resultsLabel: 'hébergements correspondent',
      mapsSearchLabel: 'Voir plus sur Google Maps',
      mapsSearchContextLabel,
      mapsSearchBaseQuery,
      venueMapHref,
      resetLabel: 'Réinitialiser',
      emptyTitle: 'Aucun hébergement ne correspond',
      emptyText: 'Retirez un filtre pour élargir les options.',
      websiteLabel: 'Site web',
      mapLabel: 'Carte',
      stays: [
        {
          name: 'Odalys City Aix-en-Provence',
          thumbnail: stayThumbnails['odalys-palais-des-congres'],
          blurb:
            'Studios et appartements équipés près du cours Gambetta, à deux pas du centre des congrès, avec parking sur place.',
          address: '15 cours Gambetta, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'aparthotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.odalys-vacances.com/',
          mapHref: mapsPin('43.52419', '5.454989'),
        },
        {
          name: 'Hôtel Cardinal',
          thumbnail: stayThumbnails['hotel-cardinal'],
          blurb:
            'Hôtel de charme au bon rapport qualité-prix, dans deux immeubles du XVIIIe siècle du quartier Mazarin.',
          address: '24 rue Cardinale, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: [],
          websiteHref: 'https://www.hotel-cardinal-aix.com/',
          mapHref: mapsPin('43.525482', '5.451718'),
        },
        {
          name: 'Villa Saint-Ange',
          thumbnail: stayThumbnails['villa-saint-ange'],
          blurb: 'Domaine 5 étoiles à quelques pas du lieu, avec parking couvert et sécurisé.',
          address: '7 traverse Saint-Pierre, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.villasaintange.com/',
          mapHref: mapsPin('43.523472', '5.458015'),
        },
        {
          name: 'Hôtel des Arts',
          thumbnail: stayThumbnails['hotel-des-arts'],
          blurb:
            'Petit hôtel 2 étoiles simple et convivial, à quelques minutes du lieu, du cours Mirabeau et de La Rotonde.',
          address: '3 rue de la Fonderie, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: [],
          websiteHref: 'https://hoteldesarts-aix.fr/',
          mapHref: mapsPin('43.529323', '5.453524'),
        },
        {
          name: 'Villa Gallici',
          thumbnail: stayThumbnails['villa-gallici'],
          blurb: 'Bastide 5 étoiles Relais & Châteaux avec jardins et parking privé, à courte distance du lieu.',
          address: '18 avenue de la Violette, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.villagallici.com/',
          mapHref: mapsPin('43.536411', '5.448629'),
        },
        {
          name: 'La petite Mazarine',
          thumbnail: stayThumbnails['la-petite-mazarine'],
          blurb:
            "Maison d'hôtes paisible de 2 chambres avec piscine partagée sur les hauteurs, à quelques minutes du centre en voiture.",
          address: '1135 chemin du vallon des lauriers, 13080 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'guesthouse',
          featureIds: ['parking'],
          websiteHref: 'https://www.aixenprovencetourism.com/fr/fiche/la-petite-mazarine-7579730',
          mapHref: mapsPin('43.545628', '5.471568'),
        },
        {
          name: 'Hôtel Le Concorde',
          thumbnail: stayThumbnails['hotel-le-concorde'],
          blurb: 'Hôtel 3 étoiles près du centre des congrès et du cours Mirabeau, avec garage privé payant.',
          address: '66-68 boulevard du Roi René, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.hotel-aixenprovence-concorde.com/',
          mapHref: mapsPin('43.524764', '5.453897'),
        },
        {
          name: 'Hôtel La Caravelle',
          thumbnail: stayThumbnails['hotel-la-caravelle'],
          blurb:
            'Hôtel 3 étoiles dans le quartier Mazarin, près du musée Granet et du cours Mirabeau, avec parkings publics à proximité.',
          address: '29 boulevard du Roi René, 13100 Aix-en-Provence',
          zoneId: 'venue-area',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.lacaravelle-hotel.com/',
          mapHref: mapsPin('43.524785', '5.45369'),
        },
        {
          name: 'Hôtel Rotonde',
          thumbnail: stayThumbnails['hotel-rotonde'],
          blurb: 'Hôtel 4 étoiles élégant à côté de La Rotonde et des gares, avec parking privé.',
          address: '15 avenue des Belges, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.hotel-rotonde.com/',
          mapHref: mapsPin('43.523677', '5.442665'),
        },
        {
          name: 'Séjours et Affaires Mirabeau',
          thumbnail: stayThumbnails['sejours-affaires-mirabeau'],
          blurb: 'Studios et deux-pièces prêts à vivre près des gares, avec parking privé couvert.',
          address: '615 avenue Wolfgang Amadeus Mozart, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'aparthotel',
          featureIds: ['parking'],
          websiteHref:
            'https://www.myresidhome.com/aix-en-provence/sejours-affaires-aix-en-provence-mirabeau/apparthotel-residence-hoteliere.html',
          mapHref: mapsPin('43.525363', '5.441426'),
        },
        {
          name: 'Boutique Hôtel Cézanne',
          thumbnail: stayThumbnails['boutique-hotel-cezanne'],
          blurb: 'Boutique-hôtel design à deux pas des gares, avec parking privé sur réservation.',
          address: '40 avenue Victor Hugo, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://boutiquehotelcezanne.com/',
          discountCode: {
            label: 'Code de réduction',
            value: 'KCDPROVENCE',
            amount: '10 % de réduction',
          },
          mapHref: mapsPin('43.523353', '5.445922'),
        },
        {
          name: 'Odalys City Aix-en-Provence Centre Rotonde',
          thumbnail: stayThumbnails['odalys-centre-rotonde'],
          blurb: 'Appart-hôtel 4 étoiles à deux pas de La Rotonde, avec garage souterrain et piscine.',
          address: '24 boulevard Albert Charrier, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'aparthotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.odalys-vacances.com/',
          mapHref: mapsPin('43.521542', '5.444778'),
        },
        {
          name: 'Hôtel Saint-Christophe',
          thumbnail: stayThumbnails['hotel-saint-christophe'],
          blurb: 'Adresse provençale classique près de La Rotonde et des gares, avec garage et parking à proximité.',
          address: '2 avenue Victor Hugo, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.hotel-saintchristophe.fr/',
          discountCode: {
            label: 'Code de réduction',
            value: 'KCDProvence15',
            amount: '15 % de réduction',
          },
          mapHref: mapsPin('43.525508', '5.446202'),
        },
        {
          name: 'Grand Hôtel Roi René - MGallery',
          thumbnail: stayThumbnails['grand-hotel-roi-rene'],
          blurb: 'Hôtel haut de gamme entre les gares et le cours Mirabeau, avec parking privé sur demande.',
          address: '24 boulevard du Roi René, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.grandhotelroirene-aixenprovence.com/',
          mapHref: mapsPin('43.523875', '5.449543'),
        },
        {
          name: 'Aparthotel Adagio Aix Centre',
          thumbnail: stayThumbnails['adagio-aix-centre'],
          blurb: 'Appartements tout équipés près de La Rotonde, rénovés en 2025, avec parking privé couvert.',
          address: '3-5 rue des Chartreux, 13100 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'aparthotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.adagio-city.com/fr/hotel-6796-aparthotel-adagio-aix-en-provence-centre/index.shtml',
          mapHref: mapsPin('43.529232', '5.440832'),
        },
        {
          name: 'Hôtel Le Pigonnet',
          thumbnail: stayThumbnails['hotel-le-pigonnet'],
          blurb: 'Écrin 5 étoiles avec jardins au sud du centre, parking privé gratuit et accès facile aux gares.',
          address: '5 avenue du Pigonnet, 13090 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.esprit-de-france.com/fr/hotels/hotel-le-pigonnet',
          mapHref: mapsPin('43.517891', '5.442081'),
        },
        {
          name: 'Villa des Félibres',
          thumbnail: stayThumbnails['villa-des-felibres'],
          blurb:
            "Maison d'hôtes de charme avec piscine et garage, au calme, avec les gares et le centre accessibles à pied.",
          address: '4 avenue Saint-Michel du Pigonnet, 13090 Aix-en-Provence',
          zoneId: 'near-stations',
          typeId: 'guesthouse',
          featureIds: ['parking'],
          websiteHref: 'https://www.aix-villa-felibres.com/',
          mapHref: mapsPin('43.516513', '5.441748'),
        },
        {
          name: 'Hôtel des Augustins',
          thumbnail: stayThumbnails['hotel-des-augustins'],
          blurb:
            'Hôtel de charme de milieu de gamme dans un ancien couvent, à deux pas du cours Mirabeau en zone piétonne.',
          address: '3 rue de la Masse, 13100 Aix-en-Provence',
          zoneId: 'historic-center',
          typeId: 'hotel',
          featureIds: [],
          websiteHref: 'https://hotel-augustins.com/',
          mapHref: mapsPin('43.526913', '5.44714'),
        },
        {
          name: 'Hôtel des Quatre Dauphins',
          thumbnail: stayThumbnails['hotel-des-quatre-dauphins'],
          blurb:
            'Hôtel chaleureux dans un hôtel particulier du XIXe siècle à Mazarin, tout près de la fontaine des Quatre Dauphins.',
          address: '54 rue Roux Alphéran, 13100 Aix-en-Provence',
          zoneId: 'historic-center',
          typeId: 'hotel',
          featureIds: [],
          websiteHref: 'https://lesquatredauphins.fr/',
          discountCode: {
            label: 'Code de réduction',
            value: 'DAUPHINS15',
            amount: '15 % de réduction',
          },
          mapHref: mapsPin('43.524955', '5.450308'),
        },
        {
          name: "La Maison d'Aix",
          thumbnail: stayThumbnails['la-maison-daix'],
          blurb: "Maison d'hôtes de charme dans un hôtel particulier, au calme dans le quartier Mazarin.",
          address: '25 rue du 4 Septembre, 13100 Aix-en-Provence',
          zoneId: 'historic-center',
          typeId: 'guesthouse',
          featureIds: [],
          websiteHref: 'https://www.lamaisondaix.com/',
          mapHref: mapsPin('43.524648', '5.450391'),
        },
        {
          name: 'Aquabella Hôtel & Spa',
          thumbnail: stayThumbnails['aquabella'],
          blurb:
            'Hôtel au calme dans le centre ancien, avec jardin et spa sensoriel près des Thermes, parking à proximité.',
          address: '2 rue des Étuves, 13100 Aix-en-Provence',
          zoneId: 'historic-center',
          typeId: 'hotel',
          featureIds: ['parking'],
          websiteHref: 'https://www.aquabella.fr/',
          mapHref: mapsPin('43.531199', '5.44503'),
        },
        {
          name: 'Villa Hélène',
          thumbnail: stayThumbnails['villa-helene'],
          blurb:
            "Maison d'hôtes élégante de 5 chambres avec piscine et table d'hôtes, dans la verdure au nord de la ville.",
          address: '920 chemin du Vallon de Bagnol, 13090 Aix-en-Provence',
          zoneId: 'historic-center',
          typeId: 'guesthouse',
          featureIds: ['parking'],
          websiteHref: 'https://www.aixenprovencetourism.com/fr/fiche/villa-helene-7337018',
          mapHref: mapsPin('43.544369', '5.434174'),
        },
      ],
    },
    checklistTitle: 'Avant de réserver',
    checklist: [
      "Réservez tôt pour loger près du lieu de l'événement ou dans le centre historique.",
      "Vérifiez le temps de marche réel jusqu'au lieu, pas seulement le nom du quartier.",
      "Arrivée tardive ? Confirmez les horaires d'accueil et l'accès en taxi.",
      'En voiture ? Vérifiez le stationnement avant de réserver un hébergement dans le centre.',
    ],
    resourcesTitle: 'Liens utiles',
    resources: [
      { text: 'Office de tourisme', href: accommodationResources.tourismOffice },
      { text: 'Plans de la ville', href: accommodationResources.maps },
      { text: 'Site du lieu', href: venueInfo.url ?? 'https://www.aixenprovence-congres.com/en/' },
    ],
    notesTitle: 'Bon à savoir',
  },
} satisfies PracticalInfoTopicData;
