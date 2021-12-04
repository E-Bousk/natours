const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

// Pipeline d'agrégation (feature de MongoDB utilisable par Mongoose)
exports.getTourStats = async (req, res) => {
  try {
    // On utilise notre 'model' "Tour" pour accéder à la 'collection' tour
    // le "pipeline d'agrégation" équivaut à utiler un requête classique
    // mais en pouvant manipuler les données suivant différentes étapes
    // ==> on passe donc un tableau appelé "stages"
    const stats = await Tour.aggregate([
      // '1st stage' : on filtre pour préparer le stage suivant (avec « $match »)
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      // 2st stage : ("group") on regroupe les documents (avec des "accumulateur"s)
      {
        $group: {
          // On doit toujours spécifier un ID => pour spécifier avec quoi on veut grouper
          // avec « _id = "null" » : pour calculer les stats de l'ensemble des "tours"
          // avec « _id: '$difficulty' », on lui attribut le nom d'un champ ("difficulty")
          // sur lequel il va effectuer les "stages" suivant (nos stats définies).
          // _id: '$difficulty',
          // (NOTE: on peut aussi avoir le champ du résultat en majuscule en le passant comme objet (avec « {} »)
          // avec un opérateur (« $toUpper »))
          _id: { $toUpper: '$difficulty' },
          // on crée un nouveau champ "numTours" dans lequel on utilise l'operateur MongoDB "$sum"
          // pour additionner 1 à chaque document qui passe dans la pipeline
          numTours: { $sum: 1 },
          // idem avec un nouveau champ "numRatings" sur le champ "ratingsQuantity"
          numRatings: { $sum: '$ratingsQuantity' },
          // on crée un nouveau champ "avgRating" dans lequel on utilise l'operateur MongoDB "$avg" sur le champ "ratingsAverage"
          avgRating: { $avg: '$ratingsAverage' },
          // etc...
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          MaxPrice: { $max: '$price' }
        }
      },
      // 3rd stage : « sort » : on tri par le prixmoyen dans l'ordre croissant (« 1 »)
      {
        $sort: { avgPrice: 1 }
      },
      // On peut aussi répéter des opérations ex : « match » pour exclure (« $ne » = 'not equal')
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
