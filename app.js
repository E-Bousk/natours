const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// **************************
// *** GLOBAL MIDDLEWARES ***
// **************************

// ** Serving static files **

// RAPPEL: permet de chercher les fichiers dans le dossier "public"
// donc dans les vues PUG, lorque l'on appelle un fichier, c'est là qu'il va le chercher
// (exemple « link(rel='stylesheet' href='css/style.css') »)
app.use(express.static(path.join(__dirname, 'public')));

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

// ** Test middleware **
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

// **************************
// ***       ROUTES       ***
// **************************

app.get('/', (req, res) => {
  // On peut passer un objet avec des données qui seront disponibles dans la vue
  res.status(200).render('base', {
    tour: 'The forest hiker',
    user: 'Aglaë & Sidonie'
  });
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
