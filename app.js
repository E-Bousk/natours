const fs = require('fs');
const express = require('express');

const app = express();

// On utilise un middleware pour modifier les données de la requête entrante
// (ie: on ajoute les données du body à la l'objet de la requête)
// [appelé middleware car entre la requête et la réponse]
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

app.get('/api/v1/tours', (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

// Pour ajouter un « tour » (sur la route "api/v1/tours" en méthode POST)
app.post('/api/v1/tours', (req, res) => {
  // "body" est une propriété disponible sur la requête parceque nous utilisons le middleware en ligne 9
  console.log('req.body => ', req.body);

  // Pour créer le nouvel ID, on récupère le dernier du fichier et on ajoute 1
  const newId = tours[tours.length - 1].id + 1;
  // La nouvelle entrée sera ce que nous envoyons dans le body + le nouvel ID
  const newTour = Object.assign({ id: newId }, req.body);

  // On enregistre cette nouvelle entrée dans le tableau "tours"
  tours.push(newTour);

  // On persiste cette nouvelle entrée (on réécrit le fichier)
  // (note: dans le cas présent, la fonction callback n'a que l'erreur)
  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    // (note: On doit toujours renvoyer qqchose afin de terminer le cycle requête/réponse)
    // On renvoie le nouvel objet créé
    res.status(201).json({
      satus: 'success',
      data: {
        tour: newTour
      }
    });
  });
});


const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
