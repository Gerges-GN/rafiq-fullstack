const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const Chat = require('../Models/Chat');
const User = require('../Models/User');
const TouristProfile = require('../Models/TouristProfile');
const TourGuideProfile = require('../Models/TourGuideProfile');
const chatController = require('../Controllers/Chat');

process.env.JWT_SECRET = 'test-only-jwt-secret-with-at-least-32-bytes';

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function request({ id = 'tourist-1', role = 'tourist', params = {}, body = {} } = {}) {
  return { user: { id, role }, params, body };
}

function fakeChat({ touristId = 'tourist-1', tourGuideId = 'guide-1', messages = [] } = {}) {
  const chat = {
    touristId,
    tourGuideId,
    messages,
    async save() {},
    async deleteOne() { chat.deleted = true; },
  };
  chat.messages.id = (id) => chat.messages.find((message) => message._id === id);
  return chat;
}

test('chat routes require a bearer token before running chat handlers', async (t) => {
  const chatRoutes = require('../Routes/Chat');
  const originalFindById = User.findById;
  User.findById = () => ({ select: async () => ({ role: 'admin' }) });
  const app = express();
  app.use('/api/chats', chatRoutes);
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    User.findById = originalFindById;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once('listening', resolve));

  const res = await fetch(`http://127.0.0.1:${server.address().port}/api/chats/chat-1`);
  assert.equal(res.status, 401);

  const adminToken = jwt.sign({ id: 'admin-id', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
  const adminRes = await fetch(`http://127.0.0.1:${server.address().port}/api/chats/chat-1`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert.equal(adminRes.status, 403);
});

test('chat creation rejects client-selected participants that exclude the caller', async (t) => {
  const originalFindById = User.findById;
  User.findById = () => { throw new Error('counterpart lookup must not run'); };
  t.after(() => { User.findById = originalFindById; });

  const res = response();
  await chatController.createChat(request({ body: { touristId: 'victim-id', tourGuideId: 'guide-1' } }), res);
  assert.equal(res.statusCode, 403);
});

test('chat creation verifies counterpart role against the database', async (t) => {
  const originalFindById = User.findById;
  const originalFindOne = Chat.findOne;
  const originalCreate = Chat.create;
  let created;
  User.findById = () => ({ select: async () => ({ role: 'tourist' }) });
  Chat.findOne = async () => null;
  Chat.create = async (chat) => { created = chat; return chat; };
  t.after(() => {
    User.findById = originalFindById;
    Chat.findOne = originalFindOne;
    Chat.create = originalCreate;
  });

  const res = response();
  await chatController.createChat(request({ body: { touristId: 'tourist-1', tourGuideId: 'guide-1' } }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(created, undefined);
});

test('message sender comes from the authenticated user, not writerId in the body', async (t) => {
  const originalFindById = Chat.findById;
  const originalUserFindById = User.findById;
  const originalTouristProfileFindOne = TouristProfile.findOne;
  const originalGuideProfileFindOne = TourGuideProfile.findOne;
  const chat = fakeChat();
  Chat.findById = async () => chat;
  User.findById = (id) => ({ select: async () => ({ name: id === 'tourist-1' ? 'Alex Morgan' : 'Guide Name' }) });
  TouristProfile.findOne = () => ({ select: async () => ({ avatarUrl: '/avatars/tourist.png' }) });
  TourGuideProfile.findOne = () => ({ select: async () => ({ avatarUrl: '/avatars/guide.png' }) });
  t.after(() => {
    Chat.findById = originalFindById;
    User.findById = originalUserFindById;
    TouristProfile.findOne = originalTouristProfileFindOne;
    TourGuideProfile.findOne = originalGuideProfileFindOne;
  });

  const res = response();
  await chatController.sendMessage(request({ body: { writerId: 'guide-1', content: '  Hello  ' } }), res);
  assert.equal(res.statusCode, 201);
  assert.equal(res.body.writerId, 'tourist-1');
  assert.equal(res.body.content, 'Hello');
  assert.equal(res.body.author.name, 'Alex Morgan');
  assert.equal(res.body.author.avatarUrl, '/avatars/tourist.png');
});

test('a nonparticipant cannot read or send to another chat', async (t) => {
  const originalFindById = Chat.findById;
  const chat = fakeChat();
  Chat.findById = async () => chat;
  t.after(() => { Chat.findById = originalFindById; });

  const readRes = response();
  await chatController.getChatById(request({ id: 'intruder-id', params: { id: 'chat-1' } }), readRes);
  assert.equal(readRes.statusCode, 404);

  const sendRes = response();
  await chatController.sendMessage(request({ id: 'intruder-id', params: { id: 'chat-1' }, body: { content: 'Nope' } }), sendRes);
  assert.equal(sendRes.statusCode, 404);
});

test('user chat list is always scoped to the authenticated user', async (t) => {
  const originalFind = Chat.find;
  let query;
  Chat.find = (filter) => {
    query = filter;
    return { sort: async () => [] };
  };
  t.after(() => { Chat.find = originalFind; });

  const res = response();
  await chatController.getChatsForUser(request({ params: { userId: 'victim-id' } }), res);
  assert.deepEqual(query, { $or: [{ touristId: 'tourist-1' }, { tourGuideId: 'tourist-1' }] });
  assert.equal(res.statusCode, 200);
});

test('message authorship cannot be forged to edit or delete another participant message', async (t) => {
  const originalFindById = Chat.findById;
  const message = {
    _id: 'message-1', writerId: 'guide-1', content: 'Guide message',
    deleteOne() { this.deleted = true; },
  };
  const chat = fakeChat({ messages: [message] });
  Chat.findById = async () => chat;
  t.after(() => { Chat.findById = originalFindById; });

  const editRes = response();
  await chatController.editMessage(request({ params: { id: 'chat-1', messageId: 'message-1' }, body: { content: 'Changed', writerId: 'tourist-1' } }), editRes);
  assert.equal(editRes.statusCode, 403);
  assert.equal(message.content, 'Guide message');

  const deleteRes = response();
  await chatController.deleteMessage(request({ params: { id: 'chat-1', messageId: 'message-1' }, body: { writerId: 'tourist-1' } }), deleteRes);
  assert.equal(deleteRes.statusCode, 403);
  assert.equal(message.deleted, undefined);
});

test('only a chat participant can delete a chat', async (t) => {
  const originalFindById = Chat.findById;
  const chat = fakeChat();
  Chat.findById = async () => chat;
  t.after(() => { Chat.findById = originalFindById; });

  const res = response();
  await chatController.deleteChat(request({ id: 'intruder-id', params: { id: 'chat-1' } }), res);
  assert.equal(res.statusCode, 404);
  assert.equal(chat.deleted, undefined);
});
