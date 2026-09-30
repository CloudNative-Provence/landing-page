import type { PracticalInfoStayThumbnail } from '~/domains/pages/practical-info/model/accommodation';

// Photo provenance and original image URLs are recorded in the accommodation assets README.
export const stayThumbnails = {
  'odalys-palais-des-congres': {
    src: '~/assets/images/pages/practical-info/accommodation/odalys-palais-des-congres.webp',
    sourceHref:
      'https://www.aixenprovencetourism.com/fr/fiche/appart-hotel-odalys-city-aix-en-provence-centre-palais-des-congres-5535063/',
    credit: 'DR / Odalys City Centre Palais des Congrès',
  },
  'hotel-cardinal': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-cardinal.webp',
    sourceHref: 'https://www.hotel-cardinal-aix.com/',
    credit: 'Hôtel Cardinal',
  },
  'villa-saint-ange': {
    src: '~/assets/images/pages/practical-info/accommodation/villa-saint-ange.webp',
    sourceHref: 'https://villasaintange.com/fr/',
    credit: 'Villa Saint-Ange',
  },
  'hotel-des-arts': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-des-arts.webp',
    sourceHref: 'https://hoteldesarts-aix.fr/',
    credit: 'Hôtel des Arts',
  },
  'villa-gallici': {
    src: '~/assets/images/pages/practical-info/accommodation/villa-gallici.webp',
    sourceHref: 'https://www.villagallici.com/fr/',
    credit: 'Villa Gallici',
  },
  'la-petite-mazarine': {
    src: '~/assets/images/pages/practical-info/accommodation/la-petite-mazarine.webp',
    sourceHref: 'https://www.aixenprovencetourism.com/fr/fiche/la-petite-mazarine-7579730/',
    credit: 'Gîtes de France',
  },
  'hotel-le-concorde': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-le-concorde.webp',
    sourceHref: 'https://www.hotel-aixenprovence-concorde.com/',
    credit: 'Hôtel Le Concorde',
  },
  'hotel-la-caravelle': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-la-caravelle.webp',
    sourceHref: 'https://www.lacaravelle-hotel.com/',
    credit: 'Hôtel La Caravelle',
  },
  'hotel-rotonde': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-rotonde.webp',
    sourceHref: 'https://www.hotel-rotonde.com/',
    credit: 'Hôtel Rotonde',
  },
  'sejours-affaires-mirabeau': {
    src: '~/assets/images/pages/practical-info/accommodation/sejours-affaires-mirabeau.webp',
    sourceHref:
      'https://www.myresidhome.com/aix-en-provence/sejours-affaires-aix-en-provence-mirabeau/apparthotel-residence-hoteliere.html',
    credit: 'Séjours & Affaires',
  },
  'boutique-hotel-cezanne': {
    src: '~/assets/images/pages/practical-info/accommodation/boutique-hotel-cezanne.webp',
    sourceHref: 'https://boutiquehotelcezanne.com/chambres-suites-boutique-hotel-aix-en-provence/',
    credit: 'Boutique Hôtel Cézanne',
  },
  'odalys-centre-rotonde': {
    src: '~/assets/images/pages/practical-info/accommodation/odalys-centre-rotonde.webp',
    sourceHref:
      'https://www.aixenprovencetourism.com/fr/fiche/appart-hotel-odalys-city-aix-en-provence-centre-rotonde-5534977/',
    credit: 'Antoine Gouedard Comte',
  },
  'hotel-saint-christophe': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-saint-christophe.webp',
    sourceHref: 'https://hotel-saintchristophe.fr/',
    credit: 'Hôtel Saint-Christophe',
  },
  'grand-hotel-roi-rene': {
    src: '~/assets/images/pages/practical-info/accommodation/grand-hotel-roi-rene.webp',
    sourceHref: 'https://all.accor.com/hotel/1169/index.fr.shtml',
    credit: 'Accor / MGallery',
  },
  'adagio-aix-centre': {
    src: '~/assets/images/pages/practical-info/accommodation/adagio-aix-centre.webp',
    sourceHref: 'https://www.adagio-city.com/fr/hotel-6796-aparthotel-adagio-aix-en-provence-centre/index.shtml',
    credit: 'Adagio',
  },
  'hotel-le-pigonnet': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-le-pigonnet.webp',
    sourceHref: 'https://www.esprit-de-france.com/fr/hotels/hotel-le-pigonnet',
    credit: 'Paloma Saint-Léger / Le Pigonnet',
  },
  'villa-des-felibres': {
    src: '~/assets/images/pages/practical-info/accommodation/villa-des-felibres.webp',
    sourceHref: 'https://www.aixenprovencetourism.com/fr/fiche/villa-des-felibres-5704062/',
    credit: 'DR / Villa des Félibres',
  },
  'hotel-des-augustins': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-des-augustins.webp',
    sourceHref: 'https://hotel-augustins.com/',
    credit: 'Hôtel des Augustins',
  },
  'hotel-des-quatre-dauphins': {
    src: '~/assets/images/pages/practical-info/accommodation/hotel-des-quatre-dauphins.webp',
    sourceHref: 'https://www.lesquatredauphins.fr/',
    credit: 'Hôtel des Quatre Dauphins',
  },
  'la-maison-daix': {
    src: '~/assets/images/pages/practical-info/accommodation/la-maison-daix.webp',
    sourceHref: 'https://www.lamaisondaix.com/en/rooms',
    credit: 'La Maison d’Aix',
  },
  aquabella: {
    src: '~/assets/images/pages/practical-info/accommodation/aquabella.webp',
    sourceHref: 'https://www.aquabella.fr/',
    credit: 'Aquabella',
  },
  'villa-helene': {
    src: '~/assets/images/pages/practical-info/accommodation/villa-helene.webp',
    sourceHref: 'https://www.aixenprovencetourism.com/fr/fiche/villa-helene-7337018/',
    credit: 'Gîtes de France',
  },
} as const satisfies Record<string, PracticalInfoStayThumbnail>;
