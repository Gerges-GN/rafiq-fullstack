const test = require('node:test');
const assert = require('node:assert/strict');
const createRateLimiter = require('../Middleware/rateLimit');

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('rate limiter allows the configured number of requests and returns Retry-After after the limit', () => {
  const limit = createRateLimiter({ windowMs: 60_000, max: 2 });
  const request = { ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } };
  const first = response();
  const second = response();
  const third = response();
  let nextCalls = 0;

  limit(request, first, () => { nextCalls += 1; });
  limit(request, second, () => { nextCalls += 1; });
  limit(request, third, () => { nextCalls += 1; });

  assert.equal(nextCalls, 2);
  assert.equal(first.headers['RateLimit-Remaining'], '1');
  assert.equal(third.statusCode, 429);
  assert.equal(Number(third.headers['Retry-After']) > 0, true);
});
