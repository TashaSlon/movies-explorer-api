const rateLimit = require('express-rate-limit');

module.exports = (req, res, next) => {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // за 15 минут
    max: 100, // можно совершить максимум 100 запросов с одного IP
  });

  next();
};
