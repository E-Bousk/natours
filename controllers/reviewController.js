const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Review.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const reviews = await features.query;

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // On implémente les routes imbriquées : On définit l'ID du 'tour' et l'ID de l'utilisateur courant
  // pour le cas où ils ne sont pas dejà spécifiés dans la requête ("req.body")
  if (!req.body.tour) req.body.tour = req.params.tourId; // On récupère l'ID depuis les paramètres de l'URL
  if (!req.body.user) req.body.user = req.user.id; // On récupère « req.user.id » grâce au middleware « protect »

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
