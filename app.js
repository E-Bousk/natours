const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// On charge « express-mongo-sanitize »
const mongoSanitize = require('express-mongo-sanitize');

// On charge « xss-clean »
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// **************************
// *** GLOBAL MIDDLEWARES ***
// **************************

// ** Set security HTTP headers **
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
app.use(express.json({ limit: '10kb' }));

// ** Data sanitization against NoSQL query injection **
// Ce middleware nettoie 'req.body', 'req.query' et 'req.params'
// en filtrant tous les « $ » et « . »
app.use(mongoSanitize());

// ** Data sanitization against XSS attack **
// Ce middleware nettoie 'req.body', 'req.query' et 'req.params'
// remplace les « < » par « &lt; »
app.use(xss());

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
