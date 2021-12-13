const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// On protège toutes les routes qui suivent ce middleware
// (Rappel: seuls les utilisateurs connectés, avec un token valide)
router.use(authController.protect);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    // on restreint aux seuls 'user'
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    // on restreint aux seuls 'admin' et 'user'
    authController.restrictTo('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    // on restreint aux seuls 'admin' et 'user'
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  );

module.exports = router;
