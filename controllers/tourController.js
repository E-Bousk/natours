const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // *** CONSTRUIT LA REQUÊTE ***
    // 1a) Fitrage
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    // 1b) Filtrage avancé
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    let query = Tour.find(JSON.parse(queryStr));

    // 2) Tri
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('_id');
    }

    // 3) Limitation des champs
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination

    // ex: tours?page=3&limit=10
    // donc en page 1 résultat = de 1 à 10, page 2 = 11 à 20, page 3 = 21 à 30...
    // skip : le nombre de résultat à sauter avant de requêter les données
    // limit : le nombre de résultat voulu dans la requête
    // query = query.skip(3).limit(10);

    // On définit 1ere page par défaut (avec « || »). Ici : 1
    // Note: on change le 'string' de la requête en 'int' en le multipliant par 1
    const page = req.query.page * 1 || 1;

    // On définit la limite/page par défault (avec « || »). Ici : 100
    const limit = req.query.limit * 1 || 100;

    // On calcul le nombre de résultats à sauter (skip)
    // (ie: tous les résultats qui sont avant la page demandée
    // donc si on demande la page 3, les résultats commenceront à partir du 21eme, on saute les 20 précédents)
    const skip = (page - 1) * limit;

    // On donne ces valeurs en paramètre à la requête
    query = query.skip(skip).limit(limit);

    // Pour le cas où la page demandée n'a aucun résultat
    // On test si on saute plus de résultat qu'il n'y en a
    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      console.log('numTours => ', numTours);
      if (numTours <= skip) throw new Error();
    }

    // *** EXECUTE LA REQUÊTE ***
    const tours = await query;
    // Peut correspondre à ceci :
    // query.sort().select().skip().limit()
    // car chaque méthode renvoie une nouvelle 'query' qui peut être chaînée à une autre méthode...

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
