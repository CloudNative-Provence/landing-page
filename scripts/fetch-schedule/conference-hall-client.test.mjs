import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { fetchConferenceHallSchedule } from './conference-hall-client.mjs';

async function serve(t, handler) {
  const server = createServer(handler);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  return `http://127.0.0.1:${server.address().port}`;
}

test('fetches the schedule export using header authentication', async (t) => {
  const payload = { name: 'Schedule', sessions: [] };
  let request;
  const apiBase = await serve(t, (req, res) => {
    request = { url: req.url, key: req.headers['x-api-key'] };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(payload));
  });

  const result = await fetchConferenceHallSchedule({ eventId: 'test-event', apiKey: 'test-key', apiBase });
  assert.deepEqual(result, payload);
  assert.deepEqual(request, { url: '/api/v1/event/test-event/schedule', key: 'test-key' });
});

test('HTTP failures stop the import without exposing the API key', async (t) => {
  const apiBase = await serve(t, (_req, res) => {
    res.writeHead(403);
    res.end('Forbidden');
  });

  await assert.rejects(
    fetchConferenceHallSchedule({ eventId: 'test-event', apiKey: 'private-test-key', apiBase }),
    (error) => {
      assert.match(error.message, /HTTP 403/);
      assert.doesNotMatch(error.message, /private-test-key/);
      return true;
    }
  );
});
