// On require le package "mongoose"
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

// On utilise la méthode 'connect' (avec options pour éviter les erreurs de dépréciation
// [« DeprecationWarning: current URL string parser is deprecated, and will be removed in a future version.
// To use the new parser, pass option { useNewUrlParser: true } to MongoClient.connect. »
// « DeprecationWarning: current Server Discovery and Monitoring engine is deprecated, and will be removed in a future version.
// To use the new Server Discover and Monitoring engine, pass option { useUnifiedTopology: true } to the MongoClient constructor. »]
// [https://mongoosejs.com/docs/5.x/docs/deprecations.html]
mongoose
  .connect(
    // Pour une connexion à la BDD locale :
    // « process.env.DATABASE_LOCAL, »
    // Pour une connexion à la BDD sur https://cloud.mongodb.com/ (« atlas ») :
    process.env.DATABASE_CLOUD.replace('<PASSWORD>', process.env.DATABASE_PASSWORD),
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  // NOTE : cette méthode retourne une promesse, on fait donc un ".then" pour la traiter
  // Cette promesse a accès à un objet 'connexion' (appellé ici "con", ie: c'est la valeur résolue de la promesse)
  .then(con => {
    // pour afficher cet objet dans la console
    console.log(con.connections);
    console.log('DB connection successful! 👍');
  })
  // (Optionnel)
  .catch(err => console.log('Failed to connect to MongoDB', err));

const app = require('./app');

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
