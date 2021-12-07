const mongoose = require('mongoose');
const dotenv = require('dotenv');

// « Uncaught exceptions » = toutes les erreurs/bugs qui apparaissent dans le code SYNCHRONE
// mais qui ne sont traités nulle part
// (NOTE: on place ce code idéalement en haut pour qu'il 'attrape' les erreurs du code suivant)
process.on('uncaughtException', err => {
  console.log('💥 UNCAUGHT EXCEPTION! 💥 Shutting down... 💥');
  console.log(err.name, err.message);
  process.exit(1);
});
// Exemple avec: un console.log de quelquechose qui n'existe pas
// console.log(x);

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

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('💥 UNHANDLER REJECTION! 💥 Shutting down... 💥');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
