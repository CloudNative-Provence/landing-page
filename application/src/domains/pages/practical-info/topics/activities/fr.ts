import { eventMeta } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';

const tourism = {
  explorer: 'https://www.aixenprovencetourism.com/explorer/',
  guidedTours: 'https://www.aixenprovencetourism.com/aix-en-provence/visites-guidees/',
  excursions: 'https://www.aixenprovencetourism.com/autour-aix-en-provence/excursions/',
  booking: 'https://booking.aixenprovencetourism.com/',
  cityPass: 'https://www.aixenprovencetourism.com/pass-touristique/',
} as const;

export default {
  metadata: {
    title: 'Activités',
    description: `Découvrez quoi faire à ${eventMeta.city} et en Provence pendant votre séjour.`,
  },
  tagline: 'Infos pratiques',
  title: 'Activités',
  summary:
    "Des idées pour prolonger votre séjour : l'Aix de Cézanne, les paysages de Provence, la gastronomie et les vins.",
  content:
    'Vous restez un peu plus longtemps ? Explorez le centre historique et ses musées à pied, partez vers la Sainte-Victoire et les villages de Provence, ou dégustez le rosé et la cuisine locale.',
  icon: 'tabler:map-star',
  callToActionLabel: 'Découvrir les activités',
  backToOverviewLabel: 'Retour aux infos pratiques',
  activitiesGuide: {
    heroTitle: 'Profitez de votre séjour',
    heroIntro:
      "De l'Aix de Cézanne aux vignobles, montagnes et calanques de Provence, voici des idées pour prolonger votre venue.",
    categoriesTitle: 'Choisissez votre journée',
    categoriesIntro: "La culture en ville, la nature autour d'Aix, ou un avant-goût de Provence.",
    categories: [
      {
        id: 'in-aix',
        title: 'À Aix-en-Provence',
        badge: 'Culture & patrimoine',
        description: 'Explorez la vieille ville et son art à pied, à quelques minutes du lieu.',
        icon: 'tabler:building-monument',
        options: [
          {
            name: 'Vieille ville & cours Mirabeau',
            blurb:
              'Flânez dans le quartier Mazarin, sur le cours Mirabeau, entre fontaines, terrasses et hôtels particuliers.',
            meta: 'Centre historique - à pied',
            tags: ['Gratuit', 'À pied'],
            linkLabel: 'Visites guidées',
            linkHref: tourism.guidedTours,
          },
          {
            name: 'Les sites de Cézanne',
            blurb: 'Sur les pas du peintre : son atelier, la bastide familiale et les carrières de Bibémus.',
            meta: 'Atelier des Lauves, Jas de Bouffan, Bibémus',
            tags: ['Réservation conseillée'],
            linkLabel: 'Les sites de Cézanne',
            linkHref: 'https://www.cezanne-en-provence.com/',
          },
          {
            name: 'Musée Granet',
            blurb: 'De Cézanne à Giacometti et la collection Planque, dans un ancien prieuré du quartier Mazarin.',
            meta: 'Place Saint-Jean-de-Malte',
            tags: ['Musée'],
            linkLabel: 'Musée Granet',
            linkHref: 'https://www.museegranet-aixenprovence.fr/',
          },
          {
            name: "Caumont Centre d'Art",
            blurb:
              'Grandes expositions dans un élégant hôtel particulier du XVIIIe siècle, avec jardins à la française et café.',
            meta: '3 rue Joseph Cabassol - Mazarin',
            tags: ['Musée', 'Café'],
            linkLabel: "Caumont Centre d'Art",
            linkHref: 'https://www.caumont-centredart.com/fr',
          },
          {
            name: 'Fondation Vasarely',
            blurb: "L'architecture op-art éblouissante de Victor Vasarely, en lisière de ville près du Jas de Bouffan.",
            meta: '1 avenue Marcel Pagnol - 10 min',
            tags: ['Musée', 'Architecture'],
            linkLabel: 'Fondation Vasarely',
            linkHref: 'https://www.fondationvasarely.org/',
          },
        ],
      },
      {
        id: 'nature',
        title: 'Nature & plein air',
        badge: "Autour d'Aix",
        description: 'Les paysages de Provence sont à deux pas : montagnes, littoral et villages perchés.',
        icon: 'tabler:mountain',
        options: [
          {
            name: 'Montagne Sainte-Victoire',
            blurb: 'La montagne calcaire chère à Cézanne, avec sentiers balisés et points de vue sur la campagne.',
            meta: '20 min en voiture - randonnée',
            tags: ['Randonnée', 'Nature'],
            linkLabel: 'Idées de randonnées',
            linkHref: 'https://www.grandsitesaintevictoire.com/pratiquer/marcher-randonner/idees-de-randonnees/',
          },
          {
            name: 'Calanques & Cassis',
            blurb:
              'Criques turquoise et falaises blanches entre Marseille et Cassis, dans le Parc national des Calanques.',
            meta: 'Environ 45 min - littoral',
            tags: ['Nature', 'Mer'],
            linkLabel: 'Excursions en Provence',
            linkHref: tourism.excursions,
          },
          {
            name: 'Villages perchés du Luberon',
            blurb: 'Gordes, Roussillon et le sentier des ocres, avec les champs de lavande en saison.',
            meta: 'Environ 45-60 min - villages',
            tags: ['Villages', 'Paysages'],
            linkLabel: 'Excursions en Provence',
            linkHref: tourism.excursions,
          },
        ],
      },
      {
        id: 'food-wine',
        title: 'Gastronomie & vins',
        badge: 'Goûter la Provence',
        description:
          "Le pays du rosé et les saveurs provençales, des étals de marché aux domaines viticoles remplis d'art.",
        icon: 'tabler:glass-full',
        options: [
          {
            name: 'Château La Coste',
            blurb:
              'Un domaine viticole en biodynamie mêlant vignes, art contemporain et architecture, avec ses restaurants.',
            meta: 'Le Puy-Sainte-Réparade - 20 min',
            tags: ['Vin', 'Art', 'Table'],
            linkLabel: 'Château La Coste',
            linkHref: 'https://chateau-la-coste.com/fr/',
          },
          {
            name: "Domaines des Coteaux d'Aix",
            blurb: "Rosé et rogue de l'appellation Coteaux d'Aix-en-Provence, avec dégustations au caveau.",
            meta: "Autour d'Aix - dégustations",
            tags: ['Vin'],
            linkLabel: 'Réserver une dégustation',
            linkHref: tourism.booking,
          },
          {
            name: 'Marchés & gastronomie provençale',
            blurb: "Produits locaux, olives, fromages et le calisson d'Aix aux marchés en plein air.",
            meta: 'Vieille ville - mar., jeu. & sam.',
            tags: ['Gratuit', 'Gourmand'],
            linkLabel: 'Que faire',
            linkHref: tourism.explorer,
          },
        ],
      },
    ],
    tipsTitle: 'Organisez vos journées',
    tips: [
      'Un jour de plus ? Les sites de Cézanne et la Sainte-Victoire se combinent bien pour une journée sur les pas du peintre.',
      "Réservez l'Atelier des Lauves et Bibémus à l'avance - les places sont limitées.",
      'Les marchés animent la vieille ville les mardi, jeudi et samedi matin.',
      'Le City Pass regroupe les grands sites, des visites guidées et le réseau de bus.',
      "En été, vérifiez les règles d'accès aux massifs de la Sainte-Victoire avant de partir.",
    ],
    resourcesTitle: 'Liens utiles',
    resources: [
      { text: 'Que faire (office de tourisme)', href: tourism.explorer },
      { text: 'Visites guidées', href: tourism.guidedTours },
      { text: 'Excursions en Provence', href: tourism.excursions },
      { text: 'Réserver une activité', href: tourism.booking },
      { text: 'Aix City Pass', href: tourism.cityPass },
    ],
    notesTitle: 'Bon à savoir',
    notes: [
      "Le musée Granet et Caumont sont à quelques pas l'un de l'autre dans le quartier Mazarin.",
      'La plupart des musées ferment le lundi ; vérifiez les horaires avant de partir.',
      'Une voiture est utile pour la Sainte-Victoire, le Luberon et le littoral ; la ville se visite à pied.',
    ],
  },
} satisfies PracticalInfoTopicData;
