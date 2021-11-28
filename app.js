const fs = require('fs');
const express = require('express');

const app = express();

// On lit le fichier et on le convertit en tableau d'objet javascript
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// on l'envoie au client (sur la route "api/v1/tours" en méthode GET)
app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',            // on spécifie le statut
    results: tours.length,        // pour renvoyer le nombre d'occurences
    data: {
      tours                       // équivalent à « tours: tours »
    }
  });
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
