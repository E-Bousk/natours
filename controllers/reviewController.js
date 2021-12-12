const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };
  const features = new APIFeatures(Review.find(filter), req.query)
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

// a) Un crée un middleware pour définir les IDs dans le 'body'
// car avec la fonction « handlefactory » on n'avait plus cette particularité
exports.setTourUserIds = (req, res, next) => {
  // (RAPPEL: pour les routes imbriquées)
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
// b) On utilise la fonction « createOne » de « handleFactory »
exports.createReview = factory.createOne(Review);

// a et b remplacent ceci :
/*
exports.createReview = catchAsync(async (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review: newReview
    }
  });
});
*/

exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
