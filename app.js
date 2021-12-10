const express = require('express');
const morgan = require('morgan');

// On charge "express-rate-limit" pour limiter le nombre de requête d'une même IP
// (prototection contre les attaques 'bruteforce' et 'DDoS')
const rateLimit = require('express-rate-limit');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// On définit une limite :
// La fonction « rateLimit » va créer une 'middleware function' basée sur l'objet d'option qu'elle reçoit
// (dans cet objet on définit combien de requêtes par IP sont autorisées en un certain laps de temps)
// Ici : 100 requêtes en 1 heure
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour!'
});
// On peut utiliser ce middleware en utilisant « app.use »
// On l'utilise seulement sur les routes « /api »
app.use('/api', limiter);

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
