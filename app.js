const express = require('express');
const morgan = require('morgan');

// On charge la classe "AppError"
const AppError = require('./utils/appError');
// On charge "errorController"
const globalErrorHandler = require('./controllers/errorController');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  // const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // err.status = 'fail';
  // err.statusCode = 404;

  // Dans "next", on passe maintenant la classe "appError" avec le 'message' et le 'status code' en arguments
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Utilise "errorController"
app.use(globalErrorHandler);

module.exports = app;
