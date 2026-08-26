const programContent = {
  metadata: {
    title: 'Program',
    description: 'Browse the KCD Provence 2026 agenda, filter sessions by track or room, and build your own day.',
  },
  hero: {
    tagline: 'Event program',
    title: 'Plan your day at KCD Provence',
    subtitle:
      'Explore the full schedule, compare tracks, save your favorite sessions, share your personal agenda, and export it to your calendar in one click.',
  },
  highlightLabels: {
    tracks: 'Tracks',
    rooms: 'Rooms',
    sessions: 'Sessions',
  },
  filters: {
    searchLabel: 'Search the schedule',
    searchPlaceholder: 'Search by title, speaker, abstract, topic…',
    trackLabel: 'Track',
    allTracksLabel: 'All tracks',
    roomLabel: 'Room',
    allRoomsLabel: 'All rooms',
    selectedOnlyLabel: 'Only my schedule',
    displayLabel: 'Display',
    liveLabel: 'Live view',
    resetLabel: 'Reset filters',
    fullscreenLabel: 'Fullscreen',
    exitFullscreenLabel: 'Exit fullscreen',
  },
  selection: {
    title: 'My schedule',
    subtitle: 'Selections are saved in your browser on this device.',
    savedLabel: 'saved sessions',
    emptyLabel: 'Select sessions to build your own conference journey.',
    clearLabel: 'Clear saved sessions',
    conflictPromptLabel:
      'This link contains an agenda different from your saved agenda. Press OK to keep the agenda from the link, or Cancel to keep your saved agenda.',
    conflictTitleLabel: 'Choose which agenda to keep',
    conflictDescriptionLabel:
      'This link includes an agenda selection that is different from the one saved on this device.',
    conflictUseLinkLabel: 'Use link agenda',
    conflictUseSavedLabel: 'Keep saved agenda',
    shareLabel: 'Share my schedule',
    exportLabel: 'Export to calendar',
    shareSuccessLabel: 'Share link copied to your clipboard.',
    shareUnavailableLabel: 'Sharing is not available here, but your link has been copied when possible.',
    exportEmptyLabel: 'Select at least one session before exporting your calendar.',
  },
  labels: {
    timeLabel: 'Time',
    roomLabel: 'Room',
    speakersLabel: 'Speakers',
    globalLabel: 'All tracks',
    liveNowLabel: 'Live now',
    upcomingLabel: 'Upcoming',
    addLabel: 'Save to my schedule',
    removeLabel: 'Saved',
    detailsLabel: 'Details',
    noResultsTitle: 'No sessions match your filters',
    noResultsText: 'Try another keyword, choose a different room, or clear the filters to see the full agenda again.',
    emptyTrackSlotLabel: 'No session is scheduled in this track during this slot.',
  },
} as const;

export default programContent;
