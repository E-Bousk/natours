const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
  console.log('req.body => ', req.body);
  switch (true) {
    case !req.body.price:
      return res.status(400).json({
        status: 'fail',
        message: 'Missing price'
      });
    case !req.body.name:
      return res.status(400).json({
        status: 'fail',
        message: 'Missing name'
      });
    default:
      next();
  }
};

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime
    // results: tours.length,
    // data: {
    //   tours
    // }
  });
};

exports.getTour = (req, res) => {
  const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);

  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

exports.createTour = (req, res) => {
  res.status(201).json({
    satus: 'success'
    // data: {
    //   tour: newTour
    // }
  });
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    satus: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    satus: 'success',
    data: null
  });
};
