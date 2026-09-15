export const tracks = [
  { id: 'keynote', accent: 'from-sky-500 to-cyan-400', roomId: 'auditorium' },
  { id: 'platform', accent: 'from-emerald-500 to-lime-400', roomId: 'luberon' },
  { id: 'builders', accent: 'from-fuchsia-500 to-rose-400', roomId: 'sainte-victoire' },
] as const;

export const rooms = [{ id: 'auditorium' }, { id: 'luberon' }, { id: 'sainte-victoire' }, { id: 'expo' }] as const;
