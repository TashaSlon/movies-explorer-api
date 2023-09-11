require('dotenv').config();
const jwt = require('jsonwebtoken');
const NotAuthError = require('../errors/not-auth-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  const token = req.cookies.jwt;
  let payload;

  try {
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    next(new NotAuthError('Необходима авторизация'));
  }

  req.user = payload;
  next();
};
