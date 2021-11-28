const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const app = express();


// ********************
// **  MIDDLEWARES   **
// ********************
app.use(morgan('dev'));
app.use(express.json());
app.use((req, res, next) => {
  console.log('Hello from the middleware (en haut du code) 👋');
  next();
});
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
})



const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));


// ********************
// ** ROUTE HANDLERS **
// ********************
const getAllTours = (req, res) => {
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
    return res.status(404).json({
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


const getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « getAllUsers » is not yet defined.'
  });
};

const getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « getUser » is not yet defined.'
  });
};

const createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « createUser » is not yet defined.'
  });
};

const updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « updateUser » is not yet defined.'
  });
};

const deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « deleteUser » is not yet defined.'
  });
};


// ********************
// **     ROUTES      **
// ********************
app
  .route('/api/v1/tours')
  .get(getAllTours)
  .post(createTour);

app
  .route('/api/v1/tours/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);
  
app
.route('/api/v1/users')
.get(getAllUsers)
.post(createUser);

app
  .route('/api/v1/users/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);


// ********************
// **  START SERVER  **
// ********************
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
