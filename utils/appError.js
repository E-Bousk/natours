class AppError extends Error {
  constructor(message, statusCode) {
    // "super" = pour appeler le constructeur parent (on y passe "message", le seul accepter)
    //(NOTE: donc pas besoin de faire « this.message = message »)
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Toutes les erreurs qui seront crées avec cette classe seront des erreurs 'operationnelles'
    // elles auront donc toutes la propriété « isOperational » = 'vrai'
    // ainsi par la suite, on testera cette propriété pour n'envoyer des messages d'erreur au client
    // que s'il s'agit d'erreurs opérationnelles crées en utilisant cette classe
    // ie: toutes les autres erreurs n'auront pas cette propriété (= vrai)
    this.isOperational = true;

    // Quand un nouvel objet est créé, la fonction "constructor" est appélée :
    // pour ne pas qu'apparaisse cet appel de fonction dans le « stack trace »
    // (pour ne pas polluer la liste qui retrace l'erreur) :
    // (NOTE: 1er : objet courant, 2nd : la classe "AppError" elle-même)
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
