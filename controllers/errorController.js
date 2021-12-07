const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: « ${value} ». Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  // Afin de créer un (long) 'string' de tous les 'strings' de toutes les erreurs
  // on boucle sur tous ces objets et on extrait les messages d'erreur dans un nouveau tableau
  const errors = Object.values(err.errors).map(el => el.message);

  // on 'joint' en un seul string avec un point et un espace
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    console.error('💥ERROR💥', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went (very) wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.name = err.name;
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // Pour gérer les erreurs de validations de Mangoose ("enum", "minLength", "max" etc...)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};
