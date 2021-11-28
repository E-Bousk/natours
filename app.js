const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

// On définit nos middleware avant nos routers (voir exemple plus bas)
app.use((req, res, next) => {
  console.log('Hello from the middleware (en haut du code) 👋');
  next();
});

// Middleware pour manipuler la requête (add current time to the request)
app.use((req, res, next) => {
  // On peut définir une propriété dans la requête appelé "requestTime"
  // on lui attribut ensuite une date de création
  // (On a maintenant "requestTime" dans notre requête)
  req.requestTime = new Date().toISOString();
  next();
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


const getAllTours = (req, res) => {
  // exemple de récupération de "requestTime"
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

const getTour = (req, res) => {
  const id = req.params.id * 1;
  const tour = tours.find(el => el.id === id);

  if (!tour) {
    return res.status(400).json({
      status: 'fail',
      message: "Invalid ID"
    });
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
};

const createTour = (req, res) => {
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
};

const updateTour = (req, res) => {

  if (req.params.id * 1 >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: "Invalid ID"
    });
  }
  
  // [...] logique de mise à jour du fichier

  res.status(200).json({
    satus: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

const deleteTour = (req, res) => {

  if (req.params.id * 1 >= tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: "Invalid ID"
    });
  }
  
  // [...] logique de mise à jour du fichier

  res.status(204).json({
    satus: 'success',
    data: null
  });
};


app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

// ‼ Si on place un middleware après une de ces routes et qu'on lance une requête dessus, il ne sera pas éxécuté
// puisque la fonction appelée par la route met fin au cycle 'request/response' (elle envoie une réponse) ‼
app.use((req, res, next) => {
  console.log('Hello from the middleware (entre les routes) 👋');
  next();
});
// ‼ En revanche, si on utilise une des routes suivantes, le console.log sera bien exécuté ‼
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);


const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
