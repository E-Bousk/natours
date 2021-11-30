// On appelle le module "dotenv"
const dotenv = require('dotenv');
// On configure la variable "dotenv" en lui indiquant l'objet 'path' 
// pour lui spécifier le chemin du fichier de configuration ("config.env")
// les variables contenues dans ce fichier vont maintenant être disponible
// dans les variables d'environnement de NodeJS (accessibles avec "process.env.XXXXX")
dotenv.config({ path: './config.env' });

const app = require('./app');

// To get in which environment 'NodeJS' is running
// (It is actually set by 'Express')
console.log('app.get("env") => ', app.get('env'));

// Liste des variables utilisées par NodeJS
console.log('process.env => ', process.env);

// On récupère la valeur de "PORT" depuis le fichier config.env
// (Note: On peut spécifier un autre port avec « || »)
const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
