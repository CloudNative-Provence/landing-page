/**
 * Render the official schedule model as TypeScript without changing source text.
 */

/**
 * Escape a string for safe inclusion inside a TypeScript single-quoted literal.
 * JSON handles newlines, carriage returns, control characters and lone surrogates;
 * the remaining replacements adapt its double-quoted syntax to single quotes.
 * @param {string} value
 * @returns {string}
 */
export function escapeSingleQuote(value) {
  return JSON.stringify(value)
    .slice(1, -1)
    .replace(/\\"/g, '"')
    .replace(/'/g, "\\'")
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/** @param {string} value */
function renderString(value) {
  return "'" + escapeSingleQuote(value) + "'";
}

/**
 * @param {string[]} values
 * @returns {string}
 */
export function renderStringArray(values) {
  return '[' + values.map(renderString).join(', ') + ']';
}

/**
 * @param {import('./sessions-mapper.mjs').SessionDefinition} session
 * @returns {string}
 */
export function renderSession(session) {
  const lines = [
    '  {',
    '    id: ' + renderString(session.id) + ',',
    '    title: ' + renderString(session.title) + ',',
    '    description: ' + renderString(session.description) + ',',
    '    startsAt: ' + renderString(session.startsAt) + ',',
    '    endsAt: ' + renderString(session.endsAt) + ',',
    '    roomId: ' + renderString(session.roomId) + ',',
  ];

  if (session.speakers?.length) {
    lines.push('    speakers: [');
    for (const speaker of session.speakers) {
      const fields = ['id: ' + renderString(speaker.id), 'name: ' + renderString(speaker.name)];
      for (const field of ['bio', 'company', 'picture']) {
        if (speaker[field]) fields.push(field + ': ' + renderString(speaker[field]));
      }
      if (speaker.socialLinks?.length) fields.push('socialLinks: ' + renderStringArray(speaker.socialLinks));
      lines.push('      { ' + fields.join(', ') + ' },');
    }
    lines.push('    ],');
  }

  if (session.format) {
    lines.push('    format: ' + renderString(session.format) + ',');
  }

  if (session.tags?.length) {
    lines.push('    tags: ' + renderStringArray(session.tags) + ',');
  }

  lines.push('  }');
  return lines.join('\n');
}

const generatedHeader = '// Generated from the official Conference Hall schedule. Run fetch-schedule to update.';
const generatedFormat = '// biome-ignore format: Preserve deterministic generated schedule source.';

/**
 * Render one schedule module shared by every locale.
 * @param {import('./schedule-mapper.mjs').ScheduleModel} model
 * @returns {string}
 */
export function renderScheduleFile(model) {
  const roomLines = model.rooms
    .map((room) =>
      [
        '  {',
        '    id: ' + renderString(room.id) + ',',
        '    label: ' + renderString(room.label) + ',',
        '    accent: ' + renderString(room.accent) + ',',
        '  },',
      ].join('\n')
    )
    .join('\n');
  const sessionLines = model.sessions.map(renderSession).join(',\n');

  return [
    generatedHeader,
    generatedFormat,
    'const rooms = [',
    roomLines,
    '] as const;',
    '',
    generatedFormat,
    'const sessions = [',
    sessionLines ? sessionLines + ',' : '',
    '] as const;',
    '',
    'export default {',
    '  rooms,',
    '  sessions,',
    '} as const;',
    '',
  ].join('\n');
}
