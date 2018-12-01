const http = require('http');
const throng = require('throng');
const jackrabbit = require('jackrabbit');

const web = require('./lib/web');

const RABBIT_URL = process.env.CLOUDAMQP_URL || 'amqp://localhost';
const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;
const PORT = process.env.PORT || 5000;

function start(id) {
  let server;
  console.log({ type: 'info', workerId: id, message: 'starting server' });

  const rabbit = jackrabbit(RABBIT_URL);

  rabbit.once('connected', listen);
  rabbit.once('disconnected', exit.bind(this, 'disconnected'));
  process.on('SIGTERM', exit);

  function listen() {
    const app = web(rabbit);

    server = http.createServer(app)
    server.listen(PORT);
  }

  function exit(reason) {
    console.log({ type: 'info', message: 'closing server', reason: reason });

    if (server) {
      server.close(process.exit.bind(process));
    } else {
      process.exit();
    }
  }
}

throng({
  workers: CONCURRENCY,
  lifetime: Infinity
}, start);