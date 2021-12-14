const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('./../utils/appError');

exports.aliasTopTours = async (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: {
        month: {
          $arrayElemAt: [
            [
              '',
              'Janvier',
              'Février',
              'Mars',
              'Avril',
              'Mai',
              'Juin',
              'Juillet',
              'Août',
              'Septembre',
              'Octobre',
              'Novembre',
              'Décembre'
            ],
            '$_id'
          ]
        }
      }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

// On récupère les 'tours' qui sont à une certaine distance d'un point définit
exports.getTourWithin = catchAsync(async (req, res, next) => {
  // On déstructure pour avoir tous les paramètres d'un seul coup
  const { distance, latlng, unit } = req.params;

  // On calcul le rayon en 'radians' (requis dans la recheche géospaciale de MongoDB)
  // ➡ on doit diviser notre distance par le rayon de la terre
  // ‼ le résultat diffère suivant que l'on ai choisit 'KM' ou 'MILES' ‼
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;

  // On récupère la latitude et la longitude en destructurant le tableau créé par « .split() »
  const [lat, lng] = latlng.split(',');
  // On vérifie si la latitude et longitude sont bien définis dans l'URL
  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude & longitude in the format « lat,lng ».',
        400
      )
    );
  }
  // console.log('💥 distance, lat, lng, unit 💥 ➡ ', distance, lat, lng, unit);
  // On fait une recherche avec l'opérateur géospatial « geoWithin »
  // https://docs.mongodb.com/manual/reference/operator/query/geoWithin/
  const tours = await Tour.find({
    // ‼ dans GeoJSON la longitude est avant la latitude ‼
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours
    }
  });
});

// ('/tours-within/:distance/center/:latlng/unit/:unit');
// 35.737825, 139.743928
