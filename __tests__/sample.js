const request = require('supertest');
const { errorHandle } = require('../src/utils');
const app = require('express')();

app.use('/', require('../src/routes'));

app.use(errorHandle);

let server, agent;

beforeEach(() => {
  return new Promise((done) => {
    // eslint-disable-next-line consistent-return
    server = app.listen(4000, (err) => {
      if (err) return done(err);

      agent = request.agent(server); // since the application is already listening, it should use the allocated port
      done();
    });
  });
});

afterEach(() => {
  return new Promise((done) => {
    return server && server.close(done);
  });
});

describe('Testing', () => {
  // eslint-disable-next-line jest/no-done-callback
  it('Ping to service', async (done) => {
    const res = await agent.get('/ping');

    expect(res.statusCode).toEqual(200);
    done();
  });
});

afterAll(async () => {
  await new Promise((resolve) => setTimeout(() => resolve(), 500)); // avoid jest open handle error
});
