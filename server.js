const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app');

mongoose
  .connect(
    process.env.DATABASE_CLOUD.replace(
      '<PASSWORD>',
      process.env.DATABASE_PASSWORD
    ),
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => console.log('DB connection successful! 👍'));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price']
  }
});

const Tour = mongoose.model('Tour', tourSchema);

// On crée une instance du 'model' "tour"
const testTour = new Tour({
  name: 'The forest hiker',
  rating: 4.7,
  price: 497
});

// On appelle la méthode "save()" dessus
// qui va retourner une promesse que l'on alors consommer
// "doc" est le document qui vient d'être sauvegardé dans la BDD
// (ie: la valeur de la promesse résolue retournée par la méthode "save"
// est le document final tel qu'il est dans la BDD)
testTour
  .save()
  .then(doc => {
    console.log(doc);
  })
  .catch(err => {
    console.log('💥Error !💥 : ', err);
  });

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
