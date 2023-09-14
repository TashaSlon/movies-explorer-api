require('dotenv').config();
const jwtoken = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const ExistError = require('../errors/exist-err');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((user) => res.status(200).send(user))
    .catch((err) => {
      next(err);
    });
};

module.exports.updateUser = (req, res, next) => {
  User.findByIdAndUpdate(
    req.user._id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  )
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при обновлении пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports.createUser = (req, res, next) => {
  const { name, email } = req.body;

  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    })
      .then((user) => res.status(201).send({
        name,
        email: user.email,
      }))
      .catch((err) => {
        if (err.code === 11000) {
          next(new ExistError('При регистрации указан email, который уже существует на сервере'));
        } else
        if (err.name === 'ValidationError') {
          next(new BadRequestError('Некорректные данные при регистрации'));
        } else {
          next(err);
        }
      }))
    .catch((err) => {
      next(err);
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const jwt = jwtoken.sign({
        _id: user._id,
      }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
      res.cookie('jwt', jwt, {
        maxAge: 3600000 * 24 * 7,
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      });
      res.send({ message: 'Пользователь авторизован' });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports.logout = (req, res) => {
  res.cookie('jwt', jwt, {
    maxAge: 3600000 * 24 * 7,
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: new Date(Date.now()) - 10000,
  }).send({ message: 'Выход' });
};
