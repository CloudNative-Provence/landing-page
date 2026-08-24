import { eventMeta, getEventPlace, getVenueInfo } from '~/domains/event/config/event';
import type { PracticalInfoTopicData } from '~/domains/pages/practical-info/model/content';
import { getLocalizedPagePath } from '~/i18n/routes';

const venuePlace = getEventPlace('fr');
const venueInfo = getVenueInfo('fr');
const hasVenue = venuePlace.trim().length > 0;
const travelDestinationLabel = hasVenue
  ? `jusqu'au ${venuePlace} ou vers le centre-ville`
  : `jusqu'au centre-ville d'${eventMeta.city}`;
const venueAddress = venueInfo.address;
const venueDescription = venueInfo.description;
const venueMapEmbedUrl = venueAddress
  ? `https://www.google.com/maps?q=${encodeURIComponent(venueAddress)}&output=embed`
  : undefined;
const venueMapHref =
  venueInfo.mapUrl ?? (venueAddress ? `https://www.google.com/maps?q=${encodeURIComponent(venueAddress)}` : undefined);

const transportResources = {
  officialGuide: 'https://www.aixenprovencetourism.com/acces-transports/',
  maps: 'https://www.aixenprovencetourism.com/preparer-son-sejour/aix-plans/',
  publicTransport: 'https://www.aixenprovencetourism.com/acces-transports/reseaux-transports-commun/',
  taxis: 'https://www.aixenprovencetourism.com/acces-transports/taxis/',
  parkAndRide: 'https://www.aixenprovencetourism.com/acces-transports/parcs-relais/',
  railBooking: 'https://www.sncf-connect.com/',
  localTransit: 'https://www.lametropolemobilite.fr/',
  airport: 'https://www.marseille.aeroport.fr/',
} as const;

export default {
  metadata: {
    title: 'Comment venir',
    description: `Préparez votre trajet vers ${eventMeta.city} en voiture, en train ou en avion.`,
  },
  tagline: 'Infos pratiques',
  title: 'Comment venir',
  summary: `Choisissez d'abord votre point d'arrivée, puis organisez les 15 à 30 dernières minutes ${travelDestinationLabel}.`,
  content: `<p>Si vous arrivez le matin même de l'événement, privilégiez l'option avec le moins de correspondences et gardez une merge pour la circulation sur le corridor de l'A8.</p><p>Pour un hôtel dans l'hypercentre, la dernière portion est souvent plus simple à pied ou en taxi une fois les bagages posés.</p>`,
  icon: 'tabler:route',
  callToActionLabel: 'Voir les options de transport',
  backToOverviewLabel: 'Retour aux infos pratiques',
  travelGuide: {
    heroTitle: "Planifiez l'arrivée la plus fluide",
    heroIntro:
      'Choisissez le parcours qui limit les correspondences inutiles, puis réservez la courte liaison finale avec une merge comfortable.',
    factsTitle: "En un coup d'oeil",
    facts: [
      {
        label: 'Gare Aix-en-Provence TGV',
        value: 'Environ 15 minutes du centre-ville',
        icon: 'tabler:train',
      },
      {
        label: 'Aéroport Marseille Provence',
        value: 'Environ 25 minutes du centre-ville',
        icon: 'tabler:plane-arrival',
      },
      {
        label: 'Accès routier',
        value: 'Accès direct via les axes A7, A8 et A51',
        icon: 'tabler:road',
      },
      {
        label: 'Dernier trajet',
        value: hasVenue
          ? `Anticipez la courte liaison jusqu'au ${venuePlace} ou vers le centre-ville`
          : `Anticipez la courte liaison jusqu'au centre-ville d'${eventMeta.city}`,
        icon: 'tabler:map-pin-share',
      },
    ],
    locationTitle: 'Adresse du lieu',
    locationAddress: venueAddress,
    locationDescription: venueDescription,
    locationMapTitle: `Plan du ${venuePlace}`,
    locationMapEmbedUrl: venueMapEmbedUrl,
    locationMapHref: venueMapHref,
    locationMapLinkLabel: 'Ouvrir dans Google Maps',
    plannerTitle: 'Planificateur de trajet',
    plannerIntro: `Choisissez le parcours qui correspond à votre façon d'arriver, puis concentrez-vous sur la liaison finale vers ${eventMeta.city}.`,
    selectorTitle: "Sélectionnez votre mode d'arrivée",
    selectorIntro:
      "Comparez l'option la plus rapide, la plus souple, ou la plus comfortable avec des bagages avant de réserver.",
    routeTitle: "Parcours en un coup d'oeil",
    routeLabel: "Flux d'arrivée",
    checklistTitle: 'Checklist avant le départ',
    linksTitle: 'Liens utiles pour cette option',
    modesTitle: 'Choisissez le mode de transport adapté à votre trajet',
    modesIntro:
      'Toutes les options fonctionnent, mais le meilleur choix dépend surtout de votre priorité: rapidité, bagages, ou flexibilité.',
    modes: [
      {
        title: 'En train',
        badge: 'Idéal depuis Paris, Lyon, Bruxelles ou Genève',
        duration: 'Environ 2h55 depuis Paris',
        summary:
          'Aix-en-Provence TGV est le hub ferroviaire le plus rapide et se situe à environ 15 km du centre-ville.',
        icon: 'tabler:train',
        route: [
          {
            title: 'Réservez votre arrivée en TGV',
            detail: 'Ne retenez un aller le jour même que si la correspondence locale vous laisse une vraie merge.',
            icon: 'tabler:ticket',
          },
          {
            title: 'Arrivez à Aix-en-Provence TGV',
            detail: 'Prévoyez ensuite une courte liaison en navette, taxi, ou voiture de location.',
            icon: 'tabler:train',
          },
          {
            title: 'Terminez la liaison finale',
            detail: hasVenue
              ? `Rejoignez le lieu de l'événement ou votre hébergement en centre-ville avec l'option la plus simple pour vos bagages.`
              : `Rejoignez le centre-ville avec l'option la plus simple pour vos bagages.`,
            icon: 'tabler:map-route',
          },
        ],
        details: [
          "Les liaisons TGV directs ou avec correspondence simple en font souvent l'option la plus prévisible pour une arrivée le jour même.",
          'Depuis la gare, poursuivez en navette, taxi, ou voiture de location selon votre hébergement.',
          'Vérifiez la dernière liaison locale avant de confirmer un train très tôt ou très tard.',
        ],
        links: [
          { text: "Guide officiel d'accès", href: transportResources.officialGuide },
          { text: 'Réserver un train', href: transportResources.railBooking },
          { text: 'Options de transport local', href: transportResources.localTransit },
        ],
      },
      {
        title: 'En avion',
        badge: 'Idéal pour les trajets internationaux ou multi-étapes',
        duration: "Environ 25 minutes jusqu'à Aix",
        summary:
          "L'aéroport Marseille Provence est l'option la plus proche et la plus souple si vous avez besoin d'un large choix de vols.",
        icon: 'tabler:plane-arrival',
        route: [
          {
            title: 'Atterrissez à Marseille Provence',
            detail: 'Ajoutez le temps de sortie, de bagages, puis du transfert routier.',
            icon: 'tabler:plane-arrival',
          },
          {
            title: 'Choisissez une liaison directe',
            detail: "Taxi ou voiture réservée à l'avance reste souvent la solution la plus fluide avec des sacs.",
            icon: 'tabler:car',
          },
          {
            title: 'Rejoignez votre hôtel ou le lieu',
            detail:
              'Si vous arrivez la veille, comparez le temps réel entre un hôtel aéroport et un hôtel centre-ville.',
            icon: 'tabler:building-community',
          },
        ],
        details: [
          'Ajoutez un peu de merge pour la récupération des bagages et le transfert routier vers Aix-en-Provence.',
          "Le taxi ou le trajet réservé à l'avance est souvent l'option la plus directe avec des bagages ou hors des meilleurs horaires de navette.",
          "Si vous arrivez la veille, comparez bien les temps de transfert entre un hôtel proche de l'aéroport et un hôtel dans le centre-ville.",
        ],
        links: [
          { text: "Site de l'aéroport", href: transportResources.airport },
          { text: "Guide officiel d'accès", href: transportResources.officialGuide },
          { text: 'Informations taxis', href: transportResources.taxis },
        ],
      },
      {
        title: 'En voiture',
        badge: 'Idéal si vous continuez ensuite en Provence',
        duration: 'Accès direct via A7, A8 et A51',
        summary:
          'La voiture offre le plus de souplesse, surtout si vous prévoyez des rendez-vous supplémentaires ou un séjour ailleurs en Provence.',
        icon: 'tabler:car',
        route: [
          {
            title: "Préparez l'approche autoroutière",
            detail: "Choisissez l'axe A7, A8, ou A51 qui évite un détour inutile le jour de l'événement.",
            icon: 'tabler:road',
          },
          {
            title: 'Décidez du stationnement avant de partir',
            detail: 'Choisissez entre un parking central et une stratégie parc-relais avant votre départ.',
            icon: 'tabler:parking',
          },
          {
            title: 'Terminez à pied ou en transport local',
            detail: 'Une fois garé, la dernière portion est souvent plus simple sans reprendre la voiture.',
            icon: 'tabler:walk',
          },
        ],
        details: [
          "La circulation du matin peut ralentir l'approche finale, donc prévoyez une merge si vous venez le jour même.",
          'Le stationnement en hypercentre est plus constraint que les parcs relais ou les options en périphérie.',
          "Si vous n'avez pas besoin de la voiture pendant la journée, garez-vous une fois puis terminez à pied ou en transport local.",
        ],
        links: [
          { text: "Guide officiel d'accès", href: transportResources.officialGuide },
          { text: 'Parcs relais', href: transportResources.parkAndRide },
          { text: 'Guide des parkings', href: 'https://www.aixenprovencetourism.com/acces-transports/parkings/' },
        ],
      },
      {
        title: 'Liaisons locales',
        badge: 'Idéal pour les 10 à 30 dernières minutes',
        duration: `À utiliser après votre arrivée à ${eventMeta.city}`,
        summary: hasVenue
          ? `Pour la liaison finale vers le ${venuePlace} ou le centre-ville, combinez transport local, taxi, ou courte marche selon vos bagages et votre timing.`
          : `Pour la liaison finale vers le centre-ville, combinez transport local, taxi, ou courte marche selon vos bagages et votre timing.`,
        icon: 'tabler:bus',
        route: [
          {
            title: 'Arrivez à votre hub principal',
            detail: "Partez de la gare TGV, de l'aéroport, de votre hôtel, ou d'un parking selon votre trajet.",
            icon: 'tabler:current-location',
          },
          {
            title: 'Choisissez la liaison la plus fluide',
            detail: "Bus, taxi, ou marche courte selon l'horaire et vos bagages.",
            icon: 'tabler:bus',
          },
          {
            title: 'Marchez la dernière portion sereinement',
            detail: 'Gardez le plan et les infos du lieu à portée pour les derniers mètres.',
            icon: 'tabler:map-pin',
          },
        ],
        details: [
          "La Métropole Mobilité et le guide de l'office de tourisme couvrent les options de transport en commun dans la ville.",
          "Les taxis sont utiles pour un planning serré, des sacs volumineux, ou un accès direct à la zone de l'événement.",
          "Si votre hôtel est central, finir à pied est souvent plus simple que gérer la circulation dans l'hypercentre.",
        ],
        links: [
          { text: 'Réseaux de transports en commun', href: transportResources.publicTransport },
          { text: 'Liste des taxis', href: transportResources.taxis },
          { text: 'Plans de la ville', href: transportResources.maps },
        ],
      },
    ],
    tipsTitle: 'Avant de partir',
    tips: [
      'Vérifiez la dernière navette ou liaison locale si vous arrivez très tôt ou tard dans la journée.',
      {
        text: "Si vous logez dans le centre, évitez de prévoir une dernière portion en voiture sauf si votre hôtel dispose d'un ",
        link: { text: 'parking', href: getLocalizedPagePath('fr', 'practical-info', 'parking') },
        textAfter: '.',
      },
      'Gardez à portée de main une application de navigation et une source officielle transport pour les changements de quai ou de circulation de dernière minute.',
    ],
    resourcesTitle: 'Ressources officielles',
    notesTitle: "Notes d'arrivée",
    resources: [
      { text: 'Site du lieu', href: venueInfo.url ?? 'https://www.aixenprovence-congres.com/en/' },
      ...(venueMapHref ? [{ text: 'Le lieu sur Google Maps', href: venueMapHref }] : []),
      {
        text: 'Accès au lieu',
        href:
          venueInfo.accessUrl ?? 'https://www.aixenprovence-congres.com/en/aix-en-provence-convention-centre/access/',
      },
      { text: 'Guide officiel Accès & Transports', href: transportResources.officialGuide },
      { text: "Plans d'Aix-en-Provence", href: transportResources.maps },
      { text: 'La Métropole Mobilité', href: transportResources.localTransit },
      { text: 'SNCF Connect', href: transportResources.railBooking },
    ],
  },
} satisfies PracticalInfoTopicData;
