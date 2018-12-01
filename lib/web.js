const express = require('express');
const path = require('path');
const morgan = require('morgan');

const logger = morgan('tiny');

module.exports = function(messageBroker) {
  function renderHome(req, res, next) {
    res.render(path.join(__dirname, 'home'));
  }

  function getKitten(req, res, next) {
    const exchange = messageBroker.default()
    const rpc = exchange.queue({ name: "kitten.get", prefetch: 1, durable: false });

    exchange.publish({}, {
        key: "kitten.get",
        reply: onReply
      }
    );

    function onReply(data) {
      res.json(data.result);
    }
  }


  return express()
    .use(logger)
    .set('view engine', 'ejs')
    .get('/', renderHome)
    .get('/api/kitten', getKitten);
}
