const mongoose = require('mongoose');
const slugify = require('slugify');

// On importe le 'model' « user »
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
      minLength: [10, 'A tour name must have more or equal then 10 characters']
    },
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
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above or equal to 1.0'],
      max: [5, 'Rating must be below or equal to 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price)'
      }
    },
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
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    // On créer le champ « guides » qui est un tableau (d'IDs)
    guides: Array
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// ***************************
// *** DOCUMENT MIDDLEWARE ***
// ***************************

tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// ‼ RAPPEL: ne fonctionne que pour un nouveau 'document' (.save() ou .create()), pas pour une mise à jour ‼
// Middleware pour récuperer le 'document' des utilisateurs correspondant aux IDs (du champ 'guides')
// ‼ On doit marquer la fonction comme « async » car on « await » « Promise.all(guidesPromises) » ‼
tourSchema.pre('save', async function(next) {
  // On boucle sur le tableau du champ 'guides' et pour chaque itération, on récupère le 'document' de l'ID courant
  // ‼ on doit marquer la fonction comme « async » car on « await » « User.findById ». On reçoit donc des promesses ‼
  // la variable qui reçoit ces « .map » est donc un tableau remplit de 'promesses
  const guidesPromises = this.guides.map(async id => await User.findById(id));
  // on doit donc les exécuter toutes en même temps avec « await Promise.all »
  // et on l'assigne dans « this.guide »c(on écrase le tableau de simple ID avec un tableau de 'documents' 'user')
  this.guides = await Promise.all(guidesPromises);
  next();
});

// ***************************
// ***  QUERY MIDDLEWARE   ***
// ***************************

tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
