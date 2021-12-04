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

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          MaxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
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

// Calculer le mois le plus chargé pour une année donnée
// ( => Calculer combien de 'tours' démarrent chaque mois pour une année donnée )
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1; // (« * 1 » = 'string' to 'integer' trick)
    const plan = await Tour.aggregate([
      {
        // Avec « unwind », on déconstruit sur un champ de type tableau
        // et il ressort un document pour chaque elément du tableau
        // ex: ici (sur « startDates ») on récupère un 'tour' pour chacunes des dates dans ce tableau
        // https://docs.mongodb.com/manual/reference/operator/aggregation/unwind/
        $unwind: '$startDates'
      },
      {
        // On filtre pour avoir uniquemnt du 01-01 au 31-12 de l'année passée dans l'URL
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        // On groupe les documents
        $group: {
          // pour les avoir par mois
          _id: { $month: '$startDates' },
          // pour les compter (on ajoute 1 à chaque document du même mois)
          numTourStarts: { $sum: 1 },
          // pour savoir quel 'tour': on crée un tableau (« $push ») des noms
          tours: { $push: '$name' }
        }
      },
      {
        // On ajoute un nouveau champ (pour remplacer « _id » qu'on va supprimer)
        $addFields: {
          // month: '$_id'
          // NOTE : Ici j'ai ajouté l'opérateur « arrayElemAt » pour remplacer les chiffres des mois par leurs noms
          // (https://docs.mongodb.com/manual/reference/operator/aggregation/arrayElemAt)
          month: {
            $arrayElemAt: [
              [
                '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
                'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
              ],
              '$_id'
            ]
          }
        }
      },
      {
        // permet de supprimer le champ « _id »
        // https://docs.mongodb.com/manual/reference/operator/aggregation/project
        $project: {
          _id: 0
        }
      },
      {
        // pour trier de manière décroissante
        $sort: { numTourStarts: -1 }
      },
      {
        // pour limiter le nombre de documents (ici réglé à 12 [inutile : juste pour l'exemple])
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
