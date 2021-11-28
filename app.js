const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json());

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));



// ***************************
// ***** REFACTORISATION *****
// ***************************
// Toutes les fonctions callback ensemble (mises dans des variables)

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
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


// ***************************
// ***** REFACTORISATION *****
// ***************************
// // Toutes les routes (sans les fonctions callback) ensemble
// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// Une meilleure factorisation :
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);
app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);


const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
