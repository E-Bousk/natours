const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();


app.use(morgan('dev'));
app.use(express.json());

// Permet d'acceder fichiers statiques depuis un dossier (et non une route)
// Exemple avec le dossier 'public': il devient le root => 127.0.01:3000/img/pin.png
app.use(express.static(`${__dirname}/public`))

app.use((req, res, next) => {
  console.log('Hello from the middleware (en haut du code) 👋');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


module.exports = app;