const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // *** 1) CONSTRUIT LA REQUÊTE ***
    const queryObj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fileds'];
    excludeFields.forEach(el => delete queryObj[el]);

    // *** Pour un filtrage plus avancé ***
    // Exemple: pour utiliser "plus grand ou égal à" ($gte), la requête MongoDB est celle-ci :
    // « { difficulty: 'easy', duration: { $gte: 5 } } »
    // L'URL sera celle-ci : « /tours?duration[gte]=5&difficulty=easy »
    // Le console.log donne : « { difficulty: 'easy', duration: { gte: '5' } } »
    // console.log(req.query);
    // On voit qu'il ne manque que l'operateur « $ » de MongoDB. Il suffit donc de le rajouter.

    // On convertit l'objet en chaîne de caractère
    let queryStr = JSON.stringify(queryObj);
    // On utilise la fonction "replace" dessus en utilisant une RegEx
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // ce qui donne : « {"difficulty":"easy","duration":{"$gte":"5"}} »
    // console.log(queryStr);
    // et on le re-transfome en JSON pour le passer dans la méthode "find"
    // ce qui donne : « { difficulty: 'easy', duration: { '$gte': '5' } } »
    // console.log(JSON.parse(queryStr));

    // *** 2) EXECUTE LA REQUÊTE ***
    // On passe donc « JSON.parse(queryStr) » à la méthode "find"
    const tours = await Tour.find(JSON.parse(queryStr));

    // *** 3) ENVOIE LA RÉPONSE ***
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
