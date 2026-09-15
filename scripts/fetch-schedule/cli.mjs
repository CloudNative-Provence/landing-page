import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import fetchSchedule from './index.mjs';

try {
  await fetchSchedule({
    core: { info: console.log },
    io: { mkdirP: (path) => mkdir(path, { recursive: true }) },
    apiKey: process.env.CONFERENCEHALL_API_KEY,
    apiBase: 'https://conference-hall.io',
    workspaceDir: fileURLToPath(new URL('../../', import.meta.url)),
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
