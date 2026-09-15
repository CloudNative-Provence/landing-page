/**
 * Renders a schedule model to TypeScript source code.
 */

/**
 * Escape a string for safe inclusion inside a TypeScript single-quoted string literal.
 * @param {string} value
 * @returns {string}
 */
export function escapeSingleQuote(value) {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Render an array of strings as a TypeScript inline array literal (single-quoted values).
 * @param {string[]} values
 * @returns {string}
 */
export function renderStringArray(values) {
  return `[${values.map((v) => `'${escapeSingleQuote(v)}'`).join(', ')}]`;
}

/**
 * Render a single session object as indented TypeScript source.
 * @param {import('./schedule-mapper.mjs').SessionDefinition} session
 * @returns {string}
 */
export function renderSession(session) {
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
  lines.push(`    trackId: '${session.trackId}',`);

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
}

/**
 * Generate the full content of a schedule TypeScript file from a model.
 * @param {import('./schedule-mapper.mjs').ScheduleModel} model
 * @returns {string}
 */
export function renderScheduleFile(model) {
  const trackLines = model.tracks
    .map(
      (t) =>
        `  { id: '${escapeSingleQuote(t.id)}', label: '${escapeSingleQuote(t.label)}', roomId: '${escapeSingleQuote(t.roomId)}' }`
    )
    .join(',\n');

  const roomLines = model.rooms
    .map((r) => `  { id: '${escapeSingleQuote(r.id)}', label: '${escapeSingleQuote(r.label)}' }`)
    .join(',\n');

  const sessionLines = model.sessions.map(renderSession).join(',\n');

  return [
    `const tracks = [`,
    trackLines ? `${trackLines},` : '',
    `] as const;`,
    ``,
    `const rooms = [`,
    roomLines ? `${roomLines},` : '',
    `] as const;`,
    ``,
    `const sessions = [`,
    sessionLines ? `${sessionLines},` : '',
    `] as const;`,
    ``,
    `export default {`,
    `  tracks,`,
    `  rooms,`,
    `  sessions,`,
    `} as const;`,
    ``,
  ].join('\n');
}
