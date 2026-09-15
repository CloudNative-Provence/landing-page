const programContent = {
  metadata: {
    title: 'Programme',
    description:
      'Consultez le programme de KCD Provence 2026, filtrez les sessions par salle et composez votre journée.',
  },
  hero: {
    tagline: 'Programme',
    title: 'Préparez votre journée à KCD Provence',
    subtitle:
      'Explorez le programme complet, enregistrez vos sessions favorites, partagez votre agenda personnel et exportez-le dans votre calendrier.',
  },
  highlightLabels: {
    rooms: 'Salles',
    sessions: 'Sessions',
  },
  filters: {
    searchLabel: 'Rechercher dans le programme',
    searchPlaceholder: 'Chercher par titre, intervenant, résumé, sujet…',
    roomLabel: 'Salle',
    allRoomsLabel: 'Toutes les salles',
    selectedOnlyLabel: 'Uniquement mon agenda',
    displayLabel: 'Affichage',
    liveLabel: 'Vue en direct',
    resetLabel: 'Réinitialiser les filtres',
    fullscreenLabel: 'Plein écran',
    exitFullscreenLabel: 'Quitter le plein écran',
  },
  selection: {
    title: 'Mon agenda',
    subtitle: 'Vos choix sont sauvegardés dans votre navigateur sur cet appareil.',
    savedLabel: 'sessions sauvegardées',
    emptyLabel: 'Sélectionnez des sessions pour composer votre agenda.',
    clearLabel: 'Effacer les sessions sauvegardées',
    conflictPromptLabel:
      "Ce lien contient un agenda différent de votre agenda sauvegardé. Appuyez sur OK pour garder l'agenda du lien, ou sur Annuler pour garder votre agenda sauvegardé.",
    conflictTitleLabel: "Choisissez l'agenda à conserver",
    conflictDescriptionLabel: 'Ce lien contient un agenda différent de celui déjà sauvegardé sur cet appareil.',
    conflictUseLinkLabel: "Utiliser l'agenda du lien",
    conflictUseSavedLabel: "Garder l'agenda sauvegardé",
    shareLabel: 'Partager mon agenda',
    exportLabel: 'Exporter dans le calendrier',
    shareSuccessLabel: 'Le lien de partage a été copié dans votre presse-papiers.',
    shareUnavailableLabel: "Le partage direct n'est pas disponible ici, mais le lien a été copié si possible.",
    exportEmptyLabel: "Sélectionnez au moins une session avant d'exporter votre calendrier.",
  },
  labels: {
    timeLabel: 'Horaire',
    roomLabel: 'Salle',
    speakersLabel: 'Intervenants',
    languageLabel: 'Langue de la session',
    languageNames: { en: 'Anglais', fr: 'Français' },
    globalLabel: 'Toutes les salles',
    liveNowLabel: 'En direct',
    upcomingLabel: 'À venir',
    addLabel: 'Ajouter à mon agenda',
    removeLabel: 'Enregistré',
    detailsLabel: 'Détails',
    closeLabel: 'Fermer',
    speakerProfileLabel: 'Voir le profil de {name}',
    speakerLinksLabel: 'Retrouvez cet intervenant en ligne',
    noResultsTitle: 'Aucune session ne correspond à vos filtres',
    noResultsText:
      'Essayez un autre mot-clé, choisissez une autre salle ou réinitialisez les filtres pour revoir tout le programme.',
  },
} as const;

export default programContent;
