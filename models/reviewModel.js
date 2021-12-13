const mongoose = require('mongoose');

// On a besoin du "TourModel" pour sauvegarder la moyenne et la quantité de 'ratings'
// que l'on calcule dans la méthode statique plus bas
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please, fill up the review!']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to an user.']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

reviewSchema.pre(/^find/, function(next) {
  /*
  « this.populate({
    path: 'tour',
    select: 'name'
  }); »
  */

  this.populate({
    path: 'user',
    select: 'name photo'
  });

  next();
});

// On crée une méthode statique pour calculer la moyenne et le nombre de 'rating' pour un 'tour' donné
// (NOTE: avec une méthode statique, « this » pointe sur le 'model' courant, ce dont on aura besoin)
reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // on utilise un 'pipeline' d'agregation (NOTE: « aggregate » doit être appelé sur un 'model')
  // on doit passer un tableau de tout ce que l'on veut agréger
  const stats = await this.aggregate([
    {
      // Selectione les 'reviews' qui appartiennent au 'tour' passé en argument
      $match: { tour: tourId }
    },
    {
      // Calcul des statistiques :
      $group: {
        // On groupe par tous les 'tours' par 'tour'
        _id: '$tour',
        // On ajoute 1 pour chaque 'rating' pour calculer leur nombre
        nRating: { $sum: 1 },
        // On calcule la moyenne en prenant les données du champ « rating »
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  console.log(stats);

  // On retroure le 'tour' dont il est question et on le met à jour
  // avec les nouvelles données calculées
  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stats[0].nRating,
    ratingsAverage: stats[0].avgRating
  });
};

// on appele cette fonction après qu'un nouveau 'review' ait été créé
reviewSchema.post('save', function() {
  // NOTE: « this » pointe sur le 'review' courant
  // ‼ NOTE 2: « Review n'est pas encore défini...
  // « Review.calcAverageRatings(this.tour); »
  // on utilise donc « this.constructor » (constructeur = 'model' qui a créé ce 'document')
  // qui pointe sur le 'model' courant
  this.constructor.calcAverageRatings(this.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
