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

// Middleware : On implémente un "route handler" pour les routes qui ne correspondent ni à celles de TOURS, ni USERS :
// (étant placé après ces routes, si on arrive sur ce middleware, c'est que le cycle de réponse n'a pas trouvé de route correspondante)
// « all » = tous les verbes (méthodes "post", "get", "catch", "patch", "delete" etc...), « * » = "tous" les URLs
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    // « originalUrl » = propriété de la requête qui est l'URL demandée
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

module.exports = app;
