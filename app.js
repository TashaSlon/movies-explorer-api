const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const process = require('process');
const { celebrate, Joi, errors } = require('celebrate');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const {
  createUser, login, logout,
} = require('./controllers/users');
const routerUsers = require('./routes/users');
const routerMovies = require('./routes/movies');
const auth = require('./middlewares/auth');
const limiter = require('./middlewares/limiter');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const { PORT = 3000, NODE_ENV, DB } = process.env;
const app = express();

mongoose.connect(NODE_ENV === 'production' ? DB : 'mongodb://localhost:27017/bitfilmsdb', {
});
app.use(express.json());

app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(requestLogger);
app.use(helmet());
app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().regex(/^[a-z0-9._%+-]+@[a-z0-9-]+.+.[a-z]{2,4}$/i),
    password: Joi.string().required().min(8),
  }),
}), login);
app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().regex(/^[a-z0-9._%+-]+@[a-z0-9-]+.+.[a-z]{2,4}$/i),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
  }),
}), createUser);

app.use(auth);
app.use('/signout', logout);
app.use('/users', routerUsers);
app.use('/movies', routerMovies);
app.use('/*', (req, res, next) => {
  next(new NotFoundError('Данной страницы не существует'));
});

app.use(errorLogger);
app.use(errors());
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });

  next();
});

app.listen(PORT);
