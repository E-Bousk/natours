const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose
  .connect(
    process.env.DATABASE_CLOUD.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    ),
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => console.log('DB connection successful! 👍'));

const port = process.env.PORT || 8000;

// NOTE : Pour ne pas fermer l'application trop brutalement,
// (interrompt toutes les requêtes en court ou en attente)
// on ferme d'abord le serveur, et seulement après l'application.
// Pour cela on doit sauvegarder le serveur dans une variable
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Pour gérer les erreurs hors d'Express - rejets no traités
// À chaque fois qu'il y a un rejet (de promesse) non traité (unhandled rejection),
// le 'process objet' va émettre un objet appelé « unhandled rejection »
// On peut donc souscrire à cet événement comme ceci :
process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('💥 UNHANDLER REJECTION! 💥 Shutting down... 💥');
  // On quitte l'application (« shut down »)
  // pour le faire par étape, on ferme d'abord le serveur (voir plus haut)
  // (on lui laisse le temps de finir toutes les requêtes traitées ou en attente)
  server.close(() => {
    //NOTE: on passe un code (0= success / 1=uncaught exception)
    process.exit(1);
  });
});
