import type { ImageMetadata } from 'astro';
import blackswift from '~/assets/images/sponsors/blackswift.svg';
import cncf from '~/assets/images/sponsors/cncf.svg';
import donow from '~/assets/images/sponsors/donow.svg';
import exoscale from '~/assets/images/sponsors/exoscale.svg';
import gravitek from '~/assets/images/sponsors/gravitek.webp';
import hoverkraft from '~/assets/images/sponsors/hoverkraft.svg';
import ikkiLeague from '~/assets/images/sponsors/ikki-league.svg';
import kraftr from '~/assets/images/sponsors/kraftr.webp';
import smartTribune from '~/assets/images/sponsors/smart-tribune.webp';
import type { AppLang } from '~/i18n/routes';

export const sponsorTiers = ['gold', 'silver', 'community'] as const;
export type SponsorTier = (typeof sponsorTiers)[number];

export interface Sponsor {
  id: string;
  name: string;
  url: string;
  tier: SponsorTier;
  logo: ImageMetadata;
  pitch: Record<AppLang, string>;
}

export const sponsors: readonly Sponsor[] = [
  {
    id: 'exoscale',
    name: 'Exoscale',
    url: 'https://www.exoscale.com/',
    tier: 'gold',
    logo: exoscale,
    pitch: {
      fr: `Exoscale est un fournisseur de cloud européen qui accompagne les équipes dans le déploiement de leurs applications. Machines virtuelles, stockage, réseau, bases de données et Kubernetes managé : nous réunissons les services essentiels pour construire et exploiter vos plateformes cloud native.

Notre infrastructure repose sur des standards ouverts, avec des données hébergées en Europe et des outils pensés pour l'automatisation. API, Terraform et intégrations Kubernetes vous permettent de garder la main sur vos déploiements. Nos ingénieurs vous accompagnent pour faire évoluer vos projects avec simplicité, maîtrise et liberté de choix.`,
      en: `Exoscale is a European cloud provider helping teams deploy their applications. Virtual machines, storage, networking, databases and managed Kubernetes: we bring together the essential services to build and operate your cloud native platforms.

Our infrastructure is built on open standards, with data hosted in Europe and tools designed for automation. APIs, Terraform and Kubernetes integrations keep you in control of your deployments. Our engineers help you grow your projects with simplicity, control and freedom of choice.`,
    },
  },
  {
    id: 'blackswift',
    name: 'BlackSwift',
    url: 'https://www.blackswift.fr/',
    tier: 'silver',
    logo: blackswift,
    pitch: {
      fr: `Plateforme Kubernetes Simplifiée

Chez BlackSwift, nous révolutionnons la gestion des infrastructures IT avec notre service de namespaces Kubernetes as a Service. Notre offre est conçue pour apporter les meilleures pratiques de Kubernetes à votre entreprise, simplifiant la complexité de la gestion des conteneurs. Profitez d'une solution Kubernetes efficace et fiable, sans les tracas de configuration et de gestion.`,
      en: `Simplified Kubernetes Platform

At BlackSwift, we are revolutionizing IT infrastructure management with our Kubernetes namespaces as a Service offering. Our service is designed to bring Kubernetes best practices to your business, simplifying the complexity of container management. Enjoy an efficient and reliable Kubernetes solution without the hassle of configuration and management.`,
    },
  },
  {
    id: 'cncf',
    name: 'CNCF',
    url: 'https://www.cncf.io/',
    tier: 'silver',
    logo: cncf,
    pitch: {
      fr: `La Cloud Native Computing Foundation (CNCF), au sein de la Linux Foundation, fait grandir l'écosystème open source du cloud native. Elle accueille des projects comme Kubernetes, Prometheus et Envoy, et réunit développeurs, entreprises utilisatrices et fournisseurs autour de technologies ouvertes et indépendantes des éditeurs.

Sa mission : rendre ces technologies accessibles au plus grand nombre. En soutenant les communautés, la formation et les rencontres entre praticiens, la CNCF crée les conditions pour apprendre, contribuer et partager des retours d'expérience. Un engagement qui fait écho à l'esprit de KCD Provence.`,
      en: `The Cloud Native Computing Foundation (CNCF), part of the Linux Foundation, helps the cloud native open source ecosystem grow. It hosts projects such as Kubernetes, Prometheus and Envoy, bringing developers, end-user organizations and vendors together around open, vendor-neutral technologies.

Its mission is to make these technologies accessible to everyone. By supporting communities, training and gatherings of practitioners, CNCF creates opportunities to learn, contribute and share real-world experience. This commitment reflects the spirit of KCD Provence.`,
    },
  },
  {
    id: 'donow',
    name: 'DoNow',
    url: 'https://do-now.io/',
    tier: 'community',
    logo: donow,
    pitch: {
      fr: `Magiciens du Cloud, chasseurs de coûts, architects de plateforme, DoNow est un cabinet de conseil à fort AND DevOps. Nous aidons nos clients à construire des plateformes sécurisées & intelligentes qui portent leurs produits tech, (re)donnent aux devs de l'autonomie et livrent aux IAs un terrain où elles peuvent exceller.

DoNow rassemble des experts aux compétences complémentaires - sécurité, infra, produit, IA - qui partagent le même état d'esprit : optimisation, transparence et curiosité.

Contributeurs open source dans l'âme, sponsoriser la KCD Provence est pour DoNow l'occasion de soutenir l'écosystème et de participer aux conversations qui dessinent le visage des futures plateformes.`,
      en: `Cloud wizards, cost hunters, platform architects: DoNow is a consultancy with strong DevOps DNA. We help our clients build secure & intelligent platforms that support their tech products, give developers their autonomy back and provide AI with an environment where it can excel.

DoNow brings together experts with complementary skills - security, infrastructure, product, AI - who share the same mindset: optimization, transparency and curiosity.

Open source contributors at heart, sponsoring KCD Provence gives DoNow the opportunity to support the ecosystem and take part in the conversations shaping the platforms of the future.`,
    },
  },
  {
    id: 'gravitek',
    name: 'Gravitek',
    url: 'https://www.gravitek.io/',
    tier: 'community',
    logo: gravitek,
    pitch: {
      fr: `Gravitek est une société à taille humaine, basée en Provence, spécialisée en Platform Engineering et Cloud Native. Plateformes internes, GitOps, Observabilité, DevSecOps : on conçoit, on développe, on déploie, et on opère sur des infrastructures souveraines. Ce qu'on construit tient dans la durée, bien au-delà de nos engagements.

Une équipe pluridisciplinaire - infra, sécurité, développement, IA - qui construit avec les équipes, pas à côté d'elles. Conseil, expertise et transmission vont ensemble : nos clients restent maîtres de leur plateforme, qu'on l'exploite avec eux ou qu'on leur en passe les clés.

Grâce à l'écosystème CNCF, on fait tourner ces plateformes tous les jours. Soutenir KCD Provence, c'est rendre un peu de ce qu'on prend le reste de l'année - et cette fois, ça se passe près de chez nous !`,
      en: `Gravitek is a people-focused company based in Provence, specializing in Platform Engineering and Cloud Native. Internal platforms, GitOps, Observability, DevSecOps: we design, develop, deploy and operate on sovereign infrastructure. What we build lasts, well beyond our commitments.

A multidisciplinary team - infrastructure, security, development, AI - that builds with teams, not separately from them. Consulting, expertise and knowledge transfer go hand in hand: our clients stay in control of their platform, whether we operate it with them or hand over the keys.

Thanks to the CNCF ecosystem, we run these platforms every day. Supporting KCD Provence means giving back a little of what we benefit from the rest of the year - and this time, it is happening close to home!`,
    },
  },
  {
    id: 'hoverkraft',
    name: 'Hoverkraft',
    url: 'https://hoverkraft.cloud/',
    tier: 'community',
    logo: hoverkraft,
    pitch: {
      fr: `Hoverkraft accompagne les équipes dans la construction de plateformes qui simplifient le quotidien des développeurs. Kubernetes, CI/CD, observabilité, sécurité : nous relions vos outils existants pour créer un environment cohérent, adapté à vos besoins et dont vous gardez la maîtrise.

Notre approach associe l'expérience des Kraft Builders aux components open source d'OpenKraft. De l'audit à la mise en production, nous construisons avec vos équipes et transmettons les compétences pour les rendre autonomes. Souveraineté, réversibilité et partage des savoir-faire sont au cœur de notre pratique du Platform Engineering.`,
      en: `Hoverkraft helps teams build platforms that simplify developers' day-to-day work. Kubernetes, CI/CD, observability, security: we connect your existing tools to create a cohesive environment that meets your needs and remains under your control.

Our approach combines the experience of Kraft Builders with OpenKraft's open source components. From the initial audit to production, we build with your teams and transfer the skills they need to become autonomous. Sovereignty, reversibility and sharing expertise are at the heart of our Platform Engineering practice.`,
    },
  },
  {
    id: 'ikki-league',
    name: 'IKKI League',
    url: 'https://www.ikki-league.com/',
    tier: 'community',
    logo: ikkiLeague,
    pitch: {
      fr: `IKKI League rassemble des expertises produit, techniques et organisationnelles pour accompagner les entreprises de la conception à l'exploitation de leurs services numériques. Nous intervenons en équipe pour construire des produits utiles, éclairer les choix technologiques et améliorer les façons de travailler.

Notre conviction : la réussite technique se construit avec les personnes. Mentorat, transmission de compétences et amélioration continue font partie de notre quotidien pour rendre les équipes autonomes. Nous adaptons nos méthodes à chaque contexte, avec une même ambition : allier qualité technique, coopération et impact concret pour les utilisateurs.`,
      en: `IKKI League brings together product, technical and organizational expertise to support businesses from the design to the operation of their digital services. We work as a team to build useful products, inform technology choices and improve ways of working.

We believe technical success is built with people. Mentoring, knowledge transfer and continuous improvement are part of our daily work to empower teams. We adapt our methods to each context, with a shared ambition: combining technical quality, collaboration and tangible impact for users.`,
    },
  },
  {
    id: 'kraftr',
    name: 'Kraftr',
    url: 'https://kraftr.tech/',
    tier: 'community',
    logo: kraftr,
    pitch: {
      fr: "Kraftr, c'est Cédric, consultant cloud indépendant, Golden Kubestronaut et praticien Kubernetes au quotidien. Il sponsorise cet événement parce qu'il en est aussi un membre : convaincu que le partage fait avancer la communauté.",
      en: 'Kraftr is Cédric, an independent cloud consultant, Golden Kubestronaut and daily Kubernetes practitioner. He sponsors this event because he is also part of its community: convinced that sharing helps the community move forward.',
    },
  },
  {
    id: 'smart-tribune',
    name: 'Smart Tribune',
    url: 'https://fr.smart-tribune.com/',
    tier: 'community',
    logo: smartTribune,
    pitch: {
      fr: "Smart Tribune est l'éditeur SaaS français spécialisé dans le selfcare et la gestion de la connaissance pour les grandes marques. Nos solutions de base de connaissance, chatbots et agents IA aident les directions de la relation client à automatiser les réponses, désengorger les services support et offrir une expérience client fluide sur tous les canaux. Plus de 170 grands comptes nous font confiance pour transformer leur relation client à l'ère de l'IA.",
      en: 'Smart Tribune is a French SaaS publisher specializing in self-service and knowledge management for major brands. Our knowledge base, chatbot and AI agent solutions help customer service departments automate responses, reduce the workload of support teams and deliver a seamless customer experience across all channels. More than 170 major companies trust us to transform their customer relationships in the age of AI.',
    },
  },
];
