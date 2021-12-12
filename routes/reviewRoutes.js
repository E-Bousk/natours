const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    // On implemente le middleware « setTourUserIds » qui récupère les IDs (route imbriquées)
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  // On implémente la route pour la mise à jour de 'review'
  .patch(reviewController.updateReview);

module.exports = router;
