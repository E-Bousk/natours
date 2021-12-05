const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
    },
    // On ajoute le champ « slug » qui sera rempli par le 'document' middleware (voir plus bas)
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty']
    },
    ratingsAverage: {
      type: Number,
      default: 4.5
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: Number,
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    // Ajout d'un champ pour les 'tours' 'secrets' (réservés)
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Middleware "Query" de Mongoose : pour agir avant ("pre") ou après ("post") l'exécution d'une requête définie
// ex: on ne veut pas avoir dans le résultat final les 'tours' 'secrets' réservés en privé
// RegEx pour avoir toutes les commandes qui commencent par « find » (« findOne », « findOneAndDelete » etc...)
tourSchema.pre(/^find/, function(next) {
  // (« this » pointe la requête en cours, et comme c'est un 'query object', on peut chaîner les méthodes)
  // "find" "secretTour" n'est pas égale à 'true'
  this.find({ secretTour: { $ne: true } });
  // *pour chronométrer le temps que met la requête : on définit le temps au début
  this.start = Date.now();
  next();
});

// Exemple de middleware qui agit après que la requête soit exécutée
// (donc "docs" sont les documents renvoyés par la requête)
tourSchema.post(/^find/, function(docs, next) {
  // *pour chronométrer le temps que met la requête : on soustrait le temps du début au temps à l'arrivée
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  console.log(docs);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
