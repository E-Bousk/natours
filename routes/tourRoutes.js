const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(
  // On protège la vue des palnnings mensuels des 'tours'
  // (Rappel: seuls les utilisateurs connéctés, avec un token valide)
  authController.protect,
  // en limitant aux seuls 'admin', 'lead-guide' et 'guide'
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

router
  .route('/')
  // On enlève 'protect' pour que tout le monde puisse accèder aux 'tours'
  .get(tourController.getAllTours)
  .post(
    // On protège la création de 'tours'
    // (Rappel: seuls les utilisateurs connéctés, avec un token valide)
    authController.protect,
    // on restreint aux seuls 'admin' et 'lead-guide'
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    // On protège l'édition des 'tours'
    // (Rappel: seuls les utilisateurs connéctés, avec un token valide)
    authController.protect,
    // en limitant aux seuls 'admin' et 'lead-guide'
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
