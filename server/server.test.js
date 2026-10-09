import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createApp, validateEntry } from './server.js';

const originalUsername = process.env.BASIC_AUTH_USERNAME;
const originalPassword = process.env.BASIC_AUTH_PASSWORD;
process.env.BASIC_AUTH_USERNAME = 'test-user';
process.env.BASIC_AUTH_PASSWORD = 'test-password';

const database = {
  from() {
    return {
      select() {
        return { limit: async () => ({ data: [], error: null }) };
      },
    };
  },
};

let server;
let baseUrl;
const auth = `Basic ${Buffer.from('test-user:test-password').toString('base64')}`;

before(() => new Promise((resolve) => {
  server = createApp(database).listen(0, '127.0.0.1', () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));

after(() => new Promise((resolve, reject) => {
  server.close((error) => {
    process.env.BASIC_AUTH_USERNAME = originalUsername;
    process.env.BASIC_AUTH_PASSWORD = originalPassword;
    if (error) reject(error);
    else resolve();
  });
}));

test('rejects requests without the access gate credentials', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 401);
  assert.match(response.headers.get('www-authenticate'), /^Basic /);
});

test('health endpoint checks the database', async () => {
  const response = await fetch(`${baseUrl}/api/health`, { headers: { authorization: auth } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', database: 'connected' });
});

test('rejects malformed resource IDs before querying the database', async () => {
  const response = await fetch(`${baseUrl}/api/items/not-an-id`, { headers: { authorization: auth } });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: 'Invalid ID' });
});

test('validates required fields and item relationships', () => {
  assert.equal(validateEntry({}, 'Item'), 'Item name is required');
  assert.equal(validateEntry({ name: 'Keys', container_id: 'wrong' }, 'Item'), 'Container must be a valid ID');
  assert.equal(validateEntry({ name: 'Keys', container_id: null, is_favorited: false }, 'Item'), null);
});
