const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// NESTED ROUTE avec mergeParams :
// On spécifie au router de prendre les paramètres qui viennent d'une autre route (qui à été imbriquée)
// exemple : « POST /tours/xxxxx/reviews » (qui est redirigé ici) on récupère l'ID du 'tour'
const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
