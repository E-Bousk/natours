// On charge la classe « AppError »
const AppError = require('./../utils/appError');

// On définit la fonction qui récupète l'erreur de Mangoose
// et qui retourne une nouvelle erreur crée avec la classe « AppError »
// (par conséquent cette erreur est alors marquée comme 'opérationnelle' (« isOperational » = true))
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
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
    // on crée une copie (hard copy) de "err" pour y assigner l'erreur retournée par la fonction ('handleCastErrorDB')
    // (NOTE1: car ce n'est pas une bonne pratique de réécrire les arguments d'une fonction (ici, celui du middleware)
    // (NOTE2: "let" et non "const" car on y va réassigner la nouvelle erreur)
    let error = { ...err };
    // Pour transformer les erreurs de Mangoose en erreurs 'opérationnelles'
    // (càd les IDs incorrect, les validations (ex: nom dupliqués, champs requis ...)) :
    // on appelle une fonction et on y passe l'erreur créer par Mangoose
    // ce qui retourne une nouvelle erreur crée avec notre classe « AppError »
    // qui sera alors marquée comme 'opérationnelle' (« isOperational » = true)
    // ‼ Assigne "manuellement" la valeur "error.name" = Problème de version Mongoose ‼
    error.name = err.name;
    if (error.name === 'CastError') error = handleCastErrorDB(error);

    sendErrorProd(error, res);
  }
};
