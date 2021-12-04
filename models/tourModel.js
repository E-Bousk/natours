const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true
    },
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
    // Pour afficher les propriétés virtuelles :
    // on passe un objet en option du 'schema' dans lequel on spécifie, avec les propriétés « toJSON » et « toObject »,
    // que chaque fois que les données sont renvoyées en JSON ou en objet, on veut y ajouter le(s) champ(s) de « virtual »
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Propriétés virtuelles
// (données qui ne seront pas stockées dans la BDD, mais dérivées des données stockées,
// et crées dès qu'on récupère des données)
// ‼ dans la fonction "get", on passe une fonction ordinaire car une fonction fléchée n'a pas son 'propre' « this » ‼
tourSchema.virtual('durationWeeks').get(function() {
  // ce "this" pointe le document en cours
  return this.duration / 7;
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
