const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// On veut créer une URL « top-5-cheap » pour avoir les 5 meilleurs 'tours'
// cette URL correspond à : « tours?limit=5&sort=-ratingsAverage,price »
// On utilise un middleware avant de lancer "getAllTours" pour modifier la requête
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
