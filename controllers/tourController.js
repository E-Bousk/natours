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

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'km' ? distance / 6378.1 : distance / 3963.2;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude & longitude in the format « lat,lng ».',
        400
      )
    );
  }

  const tours = await Tour.find({
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

// On calcul la distance entre un certain point et tous les 'tours'
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'km' ? 0.001 : 0.000621371;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude & longitude in the format « lat,lng ».',
        400
      )
    );
  }
  // Pour faire des calculs, on utilise (toujours) un pipeline d'aggrégation (qui est appellé sur le 'model' même)
  const distances = await Tour.aggregate([
    // Dans cette agrégation spéciale, il n'y a qu'une seule étape, appélée « geoNear » et qui doit toujours être la première
    // NOTE: Require également qu'au moins des champs contienne un index géospacial ( «startLocation » a un index « 2dsphere »)
    // NOTE2 : si un seul champ a un index géospatial, « geoNear » va automatiquement l'utiliser pour faire le calcul
    // mais si plusieurs champs ont un index géospatial, il faut utiliser les clefs en paramètre pour définir le champ sur lequel faire les calculs
    {
      $geoNear: {
        // 1er champ obligatoire : le point d'où calculer les distances (en GeoJSON)
        near: {
          type: 'point',
          coordinates: [lng * 1, lat * 1]
        },
        // 2ème champ requis : la distance
        // dans « distanceField » on met le nom du champ qui va être créé où toutes les distances calculées seront affichées
        distanceField: 'distance',
        // pour convertir de mètre à kilomètre (ou miles)
        distanceMultiplier: multiplier
      }
    },
    // en deuxière étape, on supprime les champs inutiles
    {
      $project: {
        // on indique ceux que l'on veut garder
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      data: distances
    }
  });
});
