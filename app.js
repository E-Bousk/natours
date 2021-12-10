const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// On charge « helmet »
const helmet = require('helmet');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// **************************
// *** GLOBAL MIDDLEWARES ***
// **************************

// ** Set security HTTP headers **
// On lance « helmet » pour ajouter des 'headers' de sécurité
// (NOTE : à placer le plus haut possible dans le code)
app.use(helmet());

// ** Development logging **
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ** limit requests from same API **
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!'
});
app.use('/api', limiter);

// ** Body parser, reading data from body into req.body **
// On spécifie quelques options (on y passe un objet)
// on limite le 'body' à 10 kilobytes
app.use(express.json({ limit: '10kb' }));

// ** Serving static files **
app.use(express.static(`${__dirname}/public`));

// ** Test middleware **
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// **************************
// ***       ROUTES       ***
// **************************

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
