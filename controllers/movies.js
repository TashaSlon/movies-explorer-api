const Movie = require('../models/movie');
const BadRequestError = require('../errors/bad-request-err');
const NotFoundError = require('../errors/not-found-err');
const NotAllowError = require('../errors/not-allow-err');

module.exports.getMovies = (req, res, next) => {
  console.log(req.user._id);
  Movie.find({ owner: req.user._id })
    .orFail(() => new NotFoundError('Пользователь с указанным id не существует'))
    .then((movies) => res.status(200).send(movies))
    .catch((err) => {
      next(err);
    });
};

module.exports.createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;

  Movie.create(
    {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      nameRU,
      nameEN,
      thumbnail,
      movieId,
      owner: req.user._id,
    },
  )
    .then((movie) => res.status(201).send(movie))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Некорректные данные при создании фильма'));
      } else {
        next(err);
      }
    });
};

module.exports.deleteMovie = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => new NotFoundError('Фильм с указанным id не существует'))
    .then((movie) => {
      if (movie.owner.toString() === req.user._id) {
        Movie.findByIdAndRemove(req.params.movieId)
          .then((item) => res.send(item))
          .catch((err) => {
            next(err);
          });
      } else {
        next(new NotAllowError('Невозможно удалить чужой фильм'));
      }
    })
    .catch((err) => {
      next(err);
    });
};
