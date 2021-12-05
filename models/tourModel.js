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
    startDates: [Date]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Middleware "document" de Mongoose : agit sur le document en cours de traitement
// (appelé aussi « hooks »)
// Comme pour les propriétés virtuelles, on définit un middlewaree sur le 'schema'
// avec « pre » on agit AVANT l'événement en cours (ici le « save »)
// donc la fonction définie ici sera excecutée avant que le document courant ne soit sauvegardé dans la BDD
// (donc avant ".save()" ou ".create()")
// (Note: uniquement "save" ou "create". Ne fonctionne pas avec "update", "findByIdAndUpdate" etc...)
tourSchema.pre('save', function(next) {
  // (« this » est le document en cours)
  this.slug = slugify(this.name, { lower: true });
  next();
});

// On peut avoir plusieurs 'pre save hook'
tourSchema.pre('save', function(next) {
  console.log('Will save document...');
  next();
});

// Avec « post », on agit après
// NOTE: ici on n'a plus accès à 'this', mais bien au document fini « doc »
tourSchema.post('save', function(doc, next) {
  console.log('doc => ', doc);
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
