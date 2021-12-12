const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

//On importe le 'review' controller
const reviewController = require('../controllers/reviewController');

const router = express.Router();

router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// On implemente des routes imbriquées « nested »
// On appelle le controlleur "createReview" dans la route « /:tourId/reviews »
// (ex: POST /tours/XXXXX/reviews)
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
