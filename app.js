const fs = require('fs');
const express = require('express');

const app = express();

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

// Pour ne récuperer qu'un seul élément (spécifié par son ID)
// On crée une variable appelée "id" (avec « : »)
//( NOTE: pour rendre une variable optionelle, on ajoute « ? » - ex: "/api/v1/tours/:id/:option?")
app.get('/api/v1/tours/:id', (req, res) => {
  console.log('req.params => ', req.params);

  // On transforme [ de STRING à INT ] la valeur de "req.params.id"
  const id = req.params.id * 1;
  
  // On récupère le tour demandé avec la méthode "find()" sur l'ID
  const tour = tours.find(el => el.id === id);

  // Cas où l'ID n'existe pas
  if (!tour) {           // ( autre solution : "if (id >= tours.length) {" )
    return res.status(400).json({
      status: 'fail',
      message: "Invalid ID"
    });
  }

  // On retourne la réponse avec le tour trouvé/demandé
  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
});

app.post('/api/v1/tours', (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);

  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
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
