const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

mongoose
  .connect(
    process.env.DATABASE_CLOUD.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    ),
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => console.log('DB connection successful! 👍'));

// Lit le fichier JSON et le convertit ("parse") en objet JS pour pouvoir le passer dans la méthode "create"
// (On a maintenant un tableau d'objets JavaScript)
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

// *** Fonction pour importer les données dans la BDD ***
// (Cette fonction async n'a pas besoin d'arguments)
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  // Pour terminer/quitter l'application (‼ manière brutale ‼)
  process.exit();
};

// *** Fonction pour supprimer toutes les données de la BDD ***
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Pour appeller/exécuter ces fonctions par le terminal on se sert de 'process.argv'
// (il suffira alors de saisir dans le terminal :
// « node dev-data/data/import-dev-data.js --delete »
// ou
// « node dev-data/data/import-dev-data.js --import »)
if (process.argv[2] === '--delete') {
  deleteData();
} else if (process.argv[2] === '--import') {
  importData();
}

// --- PROCESS.ARGV ---
// Si on saisit dans le terminal :
// « node dev-data/data/import-dev-data.js »
// le « console.log(process.argv) » retourne :
// « [
//    'C:\\Program Files\\nodejs\\node.exe',
//    'D:\\__DEV\\natours\\dev-data\\data\\import-dev-data.js'
//  ] »

// On peut saisir des options en plus :
// « node dev-data/data/import-dev-data.js --import »
// retourne :
// « [
//    'C:\\Program Files\\nodejs\\node.exe',
//    'D:\\__DEV\\natours\\dev-data\\data\\import-dev-data.js',
//    '--import'
//  ] »
