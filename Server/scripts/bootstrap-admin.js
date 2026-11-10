require('dotenv').config({ quiet: true });

const crypto = require('node:crypto');
const readline = require('node:readline');
const mongoose = require('mongoose');
const User = require('../Models/User');
const bcrypt = require('bcryptjs');

const PASSWORD_HASH_ROUNDS = 12;
const LOCK_ID = 'admin-bootstrap';

async function bootstrapAdmin({ UserModel, lockCollection, credentials }) {
  const owner = crypto.randomUUID();
  let lockAcquired = false;

  try {
    await lockCollection.findOneAndUpdate(
      { _id: LOCK_ID, expiresAt: { $lt: new Date() } },
      { $set: { owner, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } },
      { upsert: true, returnDocument: 'after' },
    );
    lockAcquired = true;
  } catch (error) {
    if (error.code === 11000) throw new Error('Another admin bootstrap is in progress.');
    throw error;
  }

  try {
    if (await UserModel.exists({ role: 'admin' })) {
      throw new Error('An admin account already exists.');
    }

    const passwordHash = await bcrypt.hash(credentials.password, PASSWORD_HASH_ROUNDS);
    const admin = await UserModel.create({
      name: credentials.name,
      email: credentials.email,
      location: credentials.location,
      password: passwordHash,
      role: 'admin',
    });

    return { id: String(admin._id) };
  } finally {
    if (lockAcquired) await lockCollection.deleteOne({ _id: LOCK_ID, owner });
  }
}

function promptVisible(rl, label) {
  return rl.question(`${label}: `);
}

function promptHidden(label) {
  const input = process.stdin;
  const output = process.stdout;
  if (!input.isTTY || typeof input.setRawMode !== 'function') {
    return Promise.reject(new Error('Admin bootstrap requires an interactive terminal for password entry.'));
  }

  return new Promise((resolve, reject) => {
    readline.emitKeypressEvents(input);
    input.setRawMode(true);
    output.write(`${label}: `);
    let value = '';

    const cleanup = () => {
      input.off('keypress', onKeypress);
      input.setRawMode(false);
      output.write('\n');
    };
    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(new Error('Admin bootstrap cancelled.'));
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        resolve(value);
      } else if (key.name === 'backspace') {
        value = Array.from(value).slice(0, -1).join('');
      } else if (!key.ctrl && !key.meta && character) {
        value += character;
      }
    };

    input.on('keypress', onKeypress);
  });
}

async function main() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be configured.');
  let rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    const name = (await promptVisible(rl, 'Admin name')).trim();
    const email = (await promptVisible(rl, 'Admin email')).trim().toLowerCase();
    const location = (await promptVisible(rl, 'Admin location')).trim();
    rl.close();
    rl = null;
    const password = await promptHidden('Admin password');
    const confirmation = await promptHidden('Confirm password');

    if (!name || name.length > 100 || !location || location.length > 200) {
      throw new Error('Name and location are required and must fit the account limits.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new Error('A valid email address is required.');
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 || password !== confirmation) {
      throw new Error('Passwords must match and be between 8 and 72 characters.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    const result = await bootstrapAdmin({
      UserModel: User,
      lockCollection: mongoose.connection.collection('rafiqBootstrapLocks'),
      credentials: { name, email, location, password },
    });
    console.log(`Admin bootstrap completed (account id: ${result.id}).`);
  } finally {
    rl?.close();
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  main().catch(() => {
    console.error('Admin bootstrap failed. Check the provided credentials and database configuration.');
    process.exitCode = 1;
  });
}

module.exports = { bootstrapAdmin };
