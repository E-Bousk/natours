const express = require('express');
const morgan = require('morgan');

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
  // SANS middleware de gestion d'erreur :
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find ${req.originalUrl} on this server!`
  // });

  // AVEC un middleware de gestion d'erreur :
  // on utilise le constructeur d'erreur pour génerer une erreur
  // dans lequel on peut passer le message d'erreur (qui sera la propriété « err.message »)
  const err = new Error(`Can't find ${req.originalUrl} on this server`);
  // on définit le statut
  err.status = 'fail';
  // on définit le code
  err.statusCode = 404;

  // En passant un argument dans « next » (quelque soit l'argument),
  // Express suppose que c'est une erreur et va sauter tous les autres middlewares de la liste d'attente ("stack")
  // et envoyer l'erreur passée au middleware de gestion d'erreur, qui sera alors executé
  next(err);
});

// Middleware pour gérer les erreurs :
// on donne ces 4 arguments et Express va automatiquement reconnaître que c'est un middleware de gestion d'erreur
// et ne va l'appeller que lorsqu'il y a une erreur opérationnelle
app.use((err, req, res, next) => {
  // On attribue un 'code' par défaut (500) si le "err.statusCode" n'est pas défini
  err.statusCode = err.statusCode || 500;
  // On attribue un 'status' par défaut ('error') si le "err.status" n'est pas défini
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

module.exports = app;
