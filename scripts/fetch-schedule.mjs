/**
 * Fetch the program schedule from the Conference Hall public API and regenerate
 * the two locale-specific schedule files:
 *   application/src/domains/pages/program/content/schedule.en.ts
 *   application/src/domains/pages/program/content/schedule.fr.ts
 *
 * Required environment variables:
 *   CONFERENCEHALL_API_KEY   – API key obtained from the Conference Hall event settings
 *   CONFERENCEHALL_EVENT_ID  – Public event ID / slug (e.g. "kcd-provence-2026")
 *
 * Optional environment variables:
 *   CONFERENCEHALL_API_BASE  – Override the base URL (default: https://conference-hall.io)
 *
 * @param {import('@actions/github-script').AsyncFunctionArguments} AsyncFunctionArguments
 */
export default async ({ core, io }) => {
  // ---------------------------------------------------------------------------
  // Configuration
  // ---------------------------------------------------------------------------

  const API_BASE = process.env.CONFERENCEHALL_API_BASE ?? 'https://conference-hall.io';
  const EVENT_ID = process.env.CONFERENCEHALL_EVENT_ID;
  const API_KEY = process.env.CONFERENCEHALL_API_KEY;

  if (!EVENT_ID) {
    core.setFailed('CONFERENCEHALL_EVENT_ID environment variable is required');
    return;
  }
  if (!API_KEY) {
    core.setFailed('CONFERENCEHALL_API_KEY environment variable is required');
    return;
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Slugify a string into a URL-safe identifier.
   * @param {string} text
   * @returns {string}
   */
  const slugify = (text) =>
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  /**
   * Extract "HH:MM" from an ISO-8601 datetime string, preserving the original
   * local time rather than converting to UTC.
   * e.g. "2026-12-10T09:00:00+01:00" → "09:00"
   * @param {string} isoString
   * @returns {string}
   */
  const formatTime = (isoString) => {
    const match = isoString.match(/T(\d{2}):(\d{2})/);
    if (!match) {
      throw new Error(`Cannot extract time from ISO string: ${isoString}`);
    }
    return `${match[1]}:${match[2]}`;
  };

  /**
   * Escape a string for safe inclusion inside a TypeScript single-quoted string.
   * @param {string} value
   * @returns {string}
   */
  const escapeSingleQuote = (value) => value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  /**
   * Render an array of strings as a TypeScript array literal (single-quoted values).
   * @param {string[]} values
   * @returns {string}
   */
  const renderStringArray = (values) => `[${values.map((v) => `'${escapeSingleQuote(v)}'`).join(', ')}]`;

  // ---------------------------------------------------------------------------
  // API → schedule model
  // ---------------------------------------------------------------------------

  /**
   * Predefined track accent colours (mapped by slugified track name).
   * @type {Record<string, string>}
   */
  const TRACK_ACCENTS = {
    keynote: 'from-sky-500 to-cyan-400',
    platform: 'from-emerald-500 to-lime-400',
    builders: 'from-fuchsia-500 to-rose-400',
  };

  const DEFAULT_ACCENT = 'from-violet-500 to-indigo-400';

  /**
   * Build the schedule model from a Conference Hall API response.
   *
   * @param {object} event
   * @returns {{ tracks: object[], rooms: object[], sessions: object[] }}
   */
  const buildScheduleModel = (event) => {
    const categories = event.categories ?? [];
    const formats = event.formats ?? [];
    const talks = event.talks ?? [];
    const schedule = event.schedule;

    const categoryById = new Map(categories.map((c) => [c.id, c]));
    const formatById = new Map(formats.map((f) => [f.id, f]));
    const talkById = new Map(talks.map((t) => [t.uid, t]));

    const tracks = categories.map((cat) => {
      const slug = slugify(cat.name);
      return { id: slug, label: cat.name, accent: TRACK_ACCENTS[slug] ?? DEFAULT_ACCENT };
    });

    const rooms = (schedule?.rooms ?? []).map((room) => ({
      id: slugify(room.name),
      label: room.name,
    }));

    const sessions = [];

    if (schedule?.sessions?.length) {
      for (const slot of schedule.sessions) {
        const talk = talkById.get(slot.talkId);
        if (!talk) continue;

        const category = talk.categories ? categoryById.get(talk.categories) : undefined;
        const format = talk.formats ? formatById.get(talk.formats) : undefined;
        const trackId = category ? slugify(category.name) : undefined;
        const roomId = slugify(schedule.rooms.find((r) => r.id === slot.roomId)?.name ?? slot.roomId);

        const session = {
          id: slugify(talk.title),
          title: talk.title,
          description: talk.abstract ?? '',
          startsAtTime: formatTime(slot.startTime),
          endsAtTime: formatTime(slot.endTime),
          trackIds: trackId ? [trackId] : [],
          roomIds: [roomId],
          speakers: talk.speakers?.map((s) => s.displayName) ?? [],
        };

        if (format) session.format = format.name;

        const tags = [];
        if (category) tags.push(slugify(category.name));
        if (talk.language) tags.push(talk.language.toLowerCase());
        if (tags.length) session.tags = tags;

        sessions.push(session);
      }
    } else {
      core.warning('No schedule data returned by the API. Sessions will have placeholder times.');
      for (const talk of talks) {
        const category = talk.categories ? categoryById.get(talk.categories) : undefined;
        const format = talk.formats ? formatById.get(talk.formats) : undefined;
        const trackId = category ? slugify(category.name) : undefined;

        const session = {
          id: slugify(talk.title),
          title: talk.title,
          description: talk.abstract ?? '',
          startsAtTime: '00:00',
          endsAtTime: '00:00',
          trackIds: trackId ? [trackId] : [],
          roomIds: [],
          speakers: talk.speakers?.map((s) => s.displayName) ?? [],
        };

        if (format) session.format = format.name;

        sessions.push(session);
      }
    }

    sessions.sort((a, b) => a.startsAtTime.localeCompare(b.startsAtTime));

    return { tracks, rooms, sessions };
  };

  // ---------------------------------------------------------------------------
  // TypeScript file generation
  // ---------------------------------------------------------------------------

  /**
   * Render a single session object as indented TypeScript source.
   * @param {object} session
   * @returns {string}
   */
  const renderSession = (session) => {
    const lines = ['  {'];
    lines.push(`    id: '${escapeSingleQuote(session.id)}',`);
    lines.push(`    title: '${escapeSingleQuote(session.title)}',`);

    if (session.description.length > 80) {
      lines.push(`    description:`);
      lines.push(`      '${escapeSingleQuote(session.description)}',`);
    } else {
      lines.push(`    description: '${escapeSingleQuote(session.description)}',`);
    }

    lines.push(`    startsAtTime: '${session.startsAtTime}',`);
    lines.push(`    endsAtTime: '${session.endsAtTime}',`);
    lines.push(`    trackIds: ${renderStringArray(session.trackIds)},`);
    lines.push(`    roomIds: ${renderStringArray(session.roomIds)},`);

    if (session.speakers?.length) {
      lines.push(`    speakers: ${renderStringArray(session.speakers)},`);
    }

    if (session.format) {
      lines.push(`    format: '${escapeSingleQuote(session.format)}',`);
    }

    if (session.isGlobal) {
      lines.push('    isGlobal: true,');
    }

    if (session.tags?.length) {
      lines.push(`    tags: ${renderStringArray(session.tags)},`);
    }

    lines.push('  }');
    return lines.join('\n');
  };

  /**
   * Generate the full content of a schedule TypeScript file.
   * @param {{ tracks: object[], rooms: object[], sessions: object[] }} model
   * @returns {string}
   */
  const renderScheduleFile = (model) => {
    const trackLines = model.tracks
      .map(
        (t) =>
          `  { id: '${escapeSingleQuote(t.id)}', label: '${escapeSingleQuote(t.label)}', accent: '${escapeSingleQuote(t.accent)}' }`
      )
      .join(',\n');

    const roomLines = model.rooms
      .map((r) => `  { id: '${escapeSingleQuote(r.id)}', label: '${escapeSingleQuote(r.label)}' }`)
      .join(',\n');

    const sessionLines = model.sessions.map(renderSession).join(',\n');

    return [
      `const tracks = [`,
      trackLines ? trackLines + ',' : '',
      `] as const;`,
      ``,
      `const rooms = [`,
      roomLines ? roomLines + ',' : '',
      `] as const;`,
      ``,
      `const sessions = [`,
      sessionLines ? sessionLines + ',' : '',
      `] as const;`,
      ``,
      `export default {`,
      `  tracks,`,
      `  rooms,`,
      `  sessions,`,
      `} as const;`,
      ``,
    ].join('\n');
  };

  // ---------------------------------------------------------------------------
  // Main
  // ---------------------------------------------------------------------------

  core.info(`Fetching schedule for event "${EVENT_ID}" from ${API_BASE} …`);

  const url = `${API_BASE}/api/v1/event/${EVENT_ID}?key=${API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) {
    core.setFailed(`HTTP ${response.status} ${response.statusText} — ${url}`);
    return;
  }

  const event = await response.json();

  core.info(`Event: ${event.name}`);
  core.info(`  Categories : ${(event.categories ?? []).length}`);
  core.info(`  Formats    : ${(event.formats ?? []).length}`);
  core.info(`  Talks      : ${(event.talks ?? []).length}`);
  core.info(`  Schedule   : ${event.schedule?.sessions?.length ?? 0} sessions`);

  const model = buildScheduleModel(event);

  const { writeFileSync } = await import('node:fs');
  const { resolve } = await import('node:path');

  const contentDir = resolve(process.env.GITHUB_WORKSPACE, 'application/src/domains/pages/program/content');

  await io.mkdirP(contentDir);

  const fileContent = renderScheduleFile(model);

  const enPath = resolve(contentDir, 'schedule.en.ts');
  const frPath = resolve(contentDir, 'schedule.fr.ts');

  writeFileSync(enPath, fileContent, 'utf-8');
  writeFileSync(frPath, fileContent, 'utf-8');

  core.info(`\nWrote ${model.tracks.length} tracks, ${model.rooms.length} rooms, ${model.sessions.length} sessions`);
  core.info(`  → ${enPath}`);
  core.info(`  → ${frPath}`);
};

