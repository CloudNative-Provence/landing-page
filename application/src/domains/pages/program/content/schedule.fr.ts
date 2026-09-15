import { rooms as baseRooms, tracks as baseTracks } from './schedule';

const tracks = [
  { ...baseTracks[0], label: 'Keynotes & communauté' },
  { ...baseTracks[1], label: 'Platform Engineering' },
  { ...baseTracks[2], label: 'Builders Track' },
] as const;

const rooms = [
  { ...baseRooms[0], label: 'Grand Auditorium' },
  { ...baseRooms[1], label: 'Salle Luberon' },
  { ...baseRooms[2], label: 'Salle Sainte-Victoire' },
  { ...baseRooms[3], label: 'Espace partenaires' },
] as const;

const sessions = [
  {
    id: 'registration-breakfast',
    title: 'Accueil & petit-déjeuner',
    description:
      'Récupérez votre badge, rencontrez les premiers participants de la journée et découvrez l’espace partenaires autour d’un café.',
    startsAtTime: '08:15',
    endsAtTime: '09:00',
    speakers: ['Équipe Cloud Native Provence'],
    format: 'Moment communauté',
    isGlobal: true,
    tags: ['networking', 'expo'],
  },
  {
    id: 'opening-keynote',
    title: 'Keynote d’ouverture · Construire le prochain chapitre cloud native en Provence',
    description:
      'Une keynote d’ouverture sur la dynamique locale, les temps forts de la communauté et les grands sujets qui marquent cette édition de KCD Provence.',
    startsAtTime: '09:00',
    endsAtTime: '09:40',
    speakers: ['Sherine Khoury', 'Frédéric Léger'],
    format: 'Keynote',
    isGlobal: true,
    tags: ['communauté', 'keynote'],
  },
  {
    id: 'platform-golden-paths',
    title: 'Des golden paths que les équipes plateforme arrivent vraiment à maintenir',
    description:
      'Comment concevoir des parcours “pavés” qui restent utiles dans le temps, avec gouvernance, feedbacks et garde-fous pragmatiques.',
    startsAtTime: '09:55',
    endsAtTime: '10:25',
    trackId: 'platform',
    speakers: ['Julie Martin'],
    format: 'Talk · 30 min',
    tags: ['platform engineering', 'developer experience'],
  },
  {
    id: 'builders-gitops',
    title: 'Le GitOps au-delà des clusters : piloter ses resources cloud proprement',
    description:
      'Un tour d’horizon concret des workflows GitOps multi-environnements, de la gestion de la dérive jusqu’aux stratégies de promotion.',
    startsAtTime: '09:55',
    endsAtTime: '10:25',
    trackId: 'builders',
    speakers: ['Marco Bellini'],
    format: 'Talk · 30 min',
    tags: ['gitops', 'ops'],
  },
  {
    id: 'keynote-observability',
    title: 'Observability : histoires vécues d’équipes qui opèrent à grande échelle',
    description:
      'Des retours terrain sur ce que les équipes surveillent, comment elles investiguent plus vite, et là où les dashboards montrent leurs limites.',
    startsAtTime: '09:55',
    endsAtTime: '10:25',
    trackId: 'keynote',
    speakers: ['Nora El Mansouri'],
    format: 'Talk · 30 min',
    tags: ['observability', 'sre'],
  },
  {
    id: 'coffee-break',
    title: 'Pause café & escape partenaires',
    description:
      'Rechargez les batteries, poursuivez la discussion dans les couloirs et rencontrez les acteurs de l’écosystème cloud native.',
    startsAtTime: '10:25',
    endsAtTime: '10:55',
    speakers: ['Partenaires & participants'],
    format: 'Pause',
    isGlobal: true,
    tags: ['pause', 'expo'],
  },
  {
    id: 'keynote-ai-platforms',
    title: 'Des workloads IA sur Kubernetes sans mettre la plateforme en vrac',
    description:
      'Une session sur l’équilibre entre besoins GPU, coûts et ergonomie développeur quand les équipes IA rejoignent la plateforme.',
    startsAtTime: '10:55',
    endsAtTime: '11:25',
    trackId: 'keynote',
    speakers: ['Thomas Perelle'],
    format: 'Talk · 30 min',
    tags: ['ia', 'kubernetes'],
  },
  {
    id: 'platform-scorecards',
    title: 'Des scorecards plateforme qui améliorent vraiment la delivery',
    description:
      'Définir une maturité de service, scorer la readiness opérationnelle et utiliser ces scorecards pour guider l’adoption sans bureaucratie.',
    startsAtTime: '10:55',
    endsAtTime: '11:25',
    trackId: 'platform',
    speakers: ['Émilien Escalle'],
    format: 'Talk · 30 min',
    tags: ['platform engineering', 'metrics'],
  },
  {
    id: 'builders-wasm',
    title: 'Expérimenter vite avec WebAssembly à l’edge',
    description:
      'Des premiers prototypes jusqu’aux patterns de production : comment les équipes utilisent les runtimes Wasm au plus près des utilisateurs.',
    startsAtTime: '10:55',
    endsAtTime: '11:25',
    trackId: 'builders',
    speakers: ['Henrik Rexed'],
    format: 'Talk · 30 min',
    tags: ['edge', 'wasm'],
  },
  {
    id: 'keynote-security',
    title: 'Des garde-fous sécurité que les équipes n’essaient pas de contourner',
    description:
      'Une approach concrète des politiques d’admission, contrôles supply chain et réglages par défaut qui aident vraiment la delivery.',
    startsAtTime: '11:35',
    endsAtTime: '12:05',
    trackId: 'keynote',
    speakers: ['Donia Chaiehloudj'],
    format: 'Talk · 30 min',
    tags: ['security', 'supply chain'],
  },
  {
    id: 'platform-finops',
    title: 'Des boucles de feedback FinOps pour les plateformes partagées',
    description:
      'Donner les bons signaux de coût aux équipes applicatives grâce à des données exploitables, du product thinking et une automatisation légère.',
    startsAtTime: '11:35',
    endsAtTime: '12:05',
    trackId: 'platform',
    speakers: ['Rémi Verchère'],
    format: 'Talk · 30 min',
    tags: ['finops', 'platform engineering'],
  },
  {
    id: 'builders-service-mesh',
    title: 'Le service mesh après la phase lune de miel',
    description:
      'Une session sans filtre sur ce que les équipes gardent, simplifient ou abandonment après plusieurs années d’exploitation.',
    startsAtTime: '11:35',
    endsAtTime: '12:05',
    trackId: 'builders',
    speakers: ['Luc Juggery'],
    format: 'Talk · 30 min',
    tags: ['networking', 'ops'],
  },
  {
    id: 'lunch',
    title: 'Déjeuner, démos & stands communauté',
    description:
      'Une longue pause pour déjeuner, découvrir les démos partenaires et continuer les échanges avec la communauté.',
    startsAtTime: '12:05',
    endsAtTime: '13:25',
    speakers: ['Partenaires & stands communauté'],
    format: 'Pause',
    isGlobal: true,
    tags: ['déjeuner', 'networking'],
  },
  {
    id: 'keynote-case-study',
    title: 'De la migration à l’élan : un retour d’expérience cloud native',
    description:
      'Un retour sans filtre sur les compromis d’une migration, ce que l’équipe a automatisé et ce qu’elle a volontairement gardé simple.',
    startsAtTime: '13:25',
    endsAtTime: '13:55',
    trackId: 'keynote',
    speakers: ['Sébastien Blanc'],
    format: 'Talk · 30 min',
    tags: ['retour expérience', 'migration'],
  },
  {
    id: 'platform-idp',
    title: 'Concevoir un portail développeur interne vers lequel on revient',
    description:
      'Passer d’un simple catalogue à un portail qui accélère l’onboarding, expose les workflows et aide à découvrir la plateforme.',
    startsAtTime: '13:25',
    endsAtTime: '13:55',
    trackId: 'platform',
    speakers: ['Camille Bernard'],
    format: 'Talk · 30 min',
    tags: ['developer portal', 'platform engineering'],
  },
  {
    id: 'builders-debugging',
    title: 'Déboguer des systèmes distribués sans perdre la salle',
    description:
      'Une session narrative sur le diagnostic d’incidents à travers queues, services et infrastructure tout en gardant une réponse collective.',
    startsAtTime: '13:25',
    endsAtTime: '13:55',
    trackId: 'builders',
    speakers: ['Amina Saidi'],
    format: 'Talk · 30 min',
    tags: ['debugging', 'distributed systems'],
  },
  {
    id: 'lightning-talks',
    title: 'Lightning talks · cinq idées en vingt minutes',
    description:
      'Un créneau très rythmé avec des mini-talks sur les tests, les métriques DORA, la policy as code, le green software et la culture plateforme.',
    startsAtTime: '14:05',
    endsAtTime: '14:30',
    speakers: ['Plusieurs intervenants'],
    format: 'Lightning talks',
    isGlobal: true,
    tags: ['lightning talks', 'communauté'],
  },
  {
    id: 'afternoon-break',
    title: 'Pause de l’après-midi',
    description:
      'Prenez un café, comparez vos notes avec d’autres participants et préparez vos derniers choix pour la fin de journée.',
    startsAtTime: '14:30',
    endsAtTime: '15:00',
    speakers: ['Espace communauté'],
    format: 'Pause',
    isGlobal: true,
    tags: ['pause', 'networking'],
  },
  {
    id: 'keynote-closing',
    title: 'Keynote de clôture · Ce que font différemment les équipes résilientes',
    description:
      'Une keynote de clôture sur l’exploitation sereine : ownership clair, escalades saines et apprentissage continu dans des systèmes rapides.',
    startsAtTime: '15:00',
    endsAtTime: '15:35',
    trackId: 'keynote',
    speakers: ['Mélanie Fontaine'],
    format: 'Keynote',
    tags: ['résilience', 'équipes'],
  },
  {
    id: 'platform-roadmaps',
    title: 'Roadmapper une plateforme produit avec de vrais retours utilisateurs',
    description:
      'Transformer signaux d’adoption, points de friction et demandes de support en une roadmap lisible et crédible.',
    startsAtTime: '15:00',
    endsAtTime: '15:35',
    trackId: 'platform',
    speakers: ['Anaïs Roux'],
    format: 'Talk · 30 min',
    tags: ['product thinking', 'platform engineering'],
  },
  {
    id: 'builders-runtimes',
    title: 'Choisir le bon runtime pour les workloads modernes',
    description:
      'Containers, functions, edge runtimes, Wasm : comparez les compromis de temps de démarrage, portabilité et complexité opérationnelle.',
    startsAtTime: '15:00',
    endsAtTime: '15:35',
    trackId: 'builders',
    speakers: ['Karim Benaissa'],
    format: 'Talk · 30 min',
    tags: ['containers', 'serverless'],
  },
  {
    id: 'closing-party',
    title: 'Mot de fin & apéro',
    description:
      'On clôture la journée avec quelques surprises, des remerciements et un apéro détendu avec speakers, bénévoles et partenaires.',
    startsAtTime: '16:00',
    endsAtTime: '18:00',
    speakers: ['Équipe Cloud Native Provence'],
    format: 'Moment communauté',
    isGlobal: true,
    tags: ['afterparty', 'networking'],
  },
] as const;

export default {
  tracks,
  rooms,
  sessions,
} as const;
