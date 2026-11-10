const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../Models/User');

process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-bytes';

const adminRoutes = require('../Routes/Admin');

function token(id) {
  return jwt.sign({ id, role: id === 'admin-id' ? 'admin' : 'tourist' }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

test('all admin routes reject requests without authentication', async (t) => {
  const originalFindById = User.findById;
  User.findById = () => { throw new Error('role lookup should not run'); };

  const app = express();
  app.use('/api/admin', adminRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    User.findById = originalFindById;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  for (const [path, method] of [['/db-scan', 'GET'], ['/migrate-reviews', 'POST'], ['/chats/chat-id', 'DELETE']]) {
    const res = await fetch(`${base}${path}`, { method });
    assert.equal(res.status, 401, `${method} ${path}`);
  }
});

test('regular users cannot access scan, migration, or destructive admin routes', async (t) => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ role: 'tourist' }) });

  const app = express();
  app.use(express.json());
  app.use('/api/admin', adminRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    User.findById = originalFindById;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const base = `http://127.0.0.1:${server.address().port}/api/admin`;
  const cases = [
    ['/db-scan', 'GET'],
    ['/migrate-reviews', 'POST'],
    ['/chats/chat-id', 'DELETE'],
    ['/fraud/flag', 'POST'],
  ];
  for (const [path, method] of cases) {
    const res = await fetch(`${base}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token('tourist-id')}`, 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({ id: 'review-id' }) : undefined,
    });
    assert.equal(res.status, 403, `${method} ${path}`);
  }
});

test('admin role passes the shared gate without invoking a database operation', async (t) => {
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ role: 'admin' }) });

  const app = express();
  app.use('/api/admin', adminRoutes);
  app.use((req, res) => res.sendStatus(204));
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    User.findById = originalFindById;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/admin/__probe`, {
    headers: { Authorization: `Bearer ${token('admin-id')}` },
  });
  assert.equal(res.status, 204);
});
