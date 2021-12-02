const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    console.log(req.query);

    // *** CONSTRUIT LA REQUÊTE ***
    // 1a) Fitrage
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fileds'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 1b) Filtrage avancé
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));
    // On change cette variable de « const » à « let » pour pouvoir chaîner la méthode "sort"
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Tri
    // (EX: pour trier dans l'ordre déscroissant, l'URL sera : « /tours?sort=-price »)
    // (EX: avec deux critères : « /tours?sort=-price,ratingsAverage »)
    if (req.query.sort) {
      // pour gérer plusieurs paramètres, et remplacer la(les) virgule(s) par un(des) espace(s)
      const sortBy = req.query.sort.split(',').join(' ');
      // console.log(sortBy);
      // On tri par la(les) valeur(s) qu'il y à dans le(s) paramètre(s) de la requête
      query = query.sort(sortBy);
    } else {
      // On ajoute un tri par défaut (le plus récent en premier)
      query = query.sort('-createdAt');
    }

    // *** EXECUTE LA REQUÊTE ***
    const tours = await query;

    // *** ENVOIE LA RÉPONSE ***
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
