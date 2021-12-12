const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');

// NESTED ROUTE avec mergeParams :
// On utilise une fonctionalité d'Express appelée « mergeParams »
// On peut donc supprimer cet import :
/*
const reviewController = require('../controllers/reviewController');
*/

// On importe le router des 'reviews'
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// NNESTED ROUTE avec mergeParams :
// On utilise une fonctionalité d'Express appelée « mergeParams »
// On peut donc supprimer cette route :
/*
router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );
*/

// On indique au router 'tour' qu'il doit utiliser le router 'review'
// s'il rencontre une route avec « /:tourId/reviews »
router.use('/:tourId/reviews', reviewRouter);

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

module.exports = router;
