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
      query = query.sort('-createdAt');
    }

    // 3) Limitation des champs
    if (req.query.fields) {
      // On récupère le(s) champ(s) voulu(s) depuis la requête et on remplace la(les) virgule(s) par un(des) espace(s)
      const fields = req.query.fields.split(',').join(' ');
      // On passe le(s) champ(s) seulement voulu(s) dans la requête
      // Note: a contrario, si on ne veut pas un ou plusieurs champ(s), on y ajoute un « - » dans l'URL
      // ex: /tours?fields=-name,-duration
      query = query.select(fields);
    } else {
      // Par défaut, on exclut le champ « __v » (avec le signe « - »)
      query = query.select('-__v');
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
