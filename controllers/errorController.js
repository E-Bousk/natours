const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // On utilise la valeur de « isOperational » de la classe « AppError »
  // pour distinguer les erreurs opérationnelles et envoyer un message en conséquence :
  // On envoie le message des l'erreur au client si c'est une erreur opérationnelle
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // si c'est une erreur de programmation ou une autre erreur inconnue, on ne divulgue pas de détails
  } else {
    // 1) affiche l'erreur dans la console
    console.error('💥ERROR💥', err);
    // 2) envoie un message générique au client
    res.status(500).json({
      status: 'error',
      message: 'Something went (very) wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // On distingue l'environnement de travail ('prod' ou 'dev')
  // afin d'envoyer des types de message différents (plus ou moins détaillés)
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
