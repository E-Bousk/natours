const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// On charge « hpp » ('HTTP Parameter Pollution')
const hpp = require('hpp');

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
app.use(mongoSanitize());

// ** Data sanitization against XSS attack **
app.use(xss());

// ** Prevent parameter pollution **
// Note: à utiliser en dernier, car il nettoie la requête ('query string')
// Exemple : dans Postman, on requête : « api/v1/tours?sort=price&sort=duration » (deux fois « sort »)
// on avait cette erreur en retour :
// « this.queryString.sort.split is not a function at APIFeatures.sort (apiFeatures.js:23:44) »
// car "split" fonctionne avec une chaîne de caractère, pas avec un tableau !!
// (le console.log donnait « this.queryString.sort = [ 'price', 'duration' ] »)
// HPP nettoie et ne garde que la dernière valeur. On n'a donc plus d'erreur et on obtient un résultat
// En revanche, autre exemple : « api/v1/tours?duration=5&duration=9 » (on veut filtrer avec ces 2 valeurs « 5 » et « 9 »)
// du coup HPP nettoie et ne garde que le « 9 ».
// Dans ce cas, il faut inscrire ce paramètre dans une 'liste blanche' avec un objet que l'on passe en option
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

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
