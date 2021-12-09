const express = require('express');
const tourController = require('../controllers/tourController');

// on charge « authController »
const authController = require('../controllers/authController');

const router = express.Router();

router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  // On utilise un middleware ('protect') pour protéger la route et vérifier que l'utilisateur est connecté
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
