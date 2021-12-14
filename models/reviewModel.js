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
  console.log('stats', stats);

  // On retroure le 'tour' dont il est question et on le met à jour
  // avec les nouvelles données calculées
  // On n'execute cette partie du code que lorsque le tableau n'est pas vide
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

// pour la CRÉATION d'un nouveau 'review'
// (« post » pour pouvoir faire le calcul avec les nouvelles données)
reviewSchema.post('save', function() {
  // NOTE: « this » pointe sur le 'review' courant
  // ‼ NOTE 2: « Review n'est pas encore défini...
  // « Review.calcAverageRatings(this.tour); »
  // on utilise donc « this.constructor » (constructeur = 'model' qui a créé ce 'document')
  // qui pointe sur le 'model' courant
  this.constructor.calcAverageRatings(this.tour);
});

// Pour la MISE À JOUR ou la SUPPRESSION d'un 'review'
// (« findOneAndUpdate » ou « findOneAndDelete »)
// on le fait en 2 étapes : 1ere étape :
//  ‼ Ici, on a besoin du document courant mais « this » pointe sur la requête en cours
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // ➡ On exécute donc une requête qui nous donne le 'document'
  // (on l'"await" et l'attribut à « this.rev ») pour pouvoir le passer au middleware suivant
  // On récupère ainsi l'ID du 'tour'
  // ‼ On ne peut donc pas utiliser « post » mais « pre » sinon la requête aurait déjà été exécutée
  this.rev = await this.findOne();
  console.log('this.rev', this.rev);
  next();
});

// 2ème étape :
// On utilise « post » maintenant que la 'review' à été mise à jour (ou supprimée)
// On peut maintenant calculer les statistiques
reviewSchema.post(/^findOneAnd/, async function() {
  // « await this.findOne(); » ne fonctionne pas ici, car la requête a déjà été exécutée

  // On doit appeller cette méthode sur un 'model' donc « this.rev.constructor »
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
