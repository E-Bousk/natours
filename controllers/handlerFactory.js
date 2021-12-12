const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// On charge « APIFeatures »
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(
        new AppError(`No document found with this ID (${req.params.id})`, 404)
      );
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!doc) {
      return next(
        new AppError(`No document found with this ID (${req.params.id})`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: newDoc
      }
    });
  });

// On ajoute une otion pour le 'populate' présent dans « getTour »
// On va creer la requête, et s'il y a une objet option 'populate', on l'y ajoute
// et on 'await' cette requête
exports.getOne = (Model, populateOption) =>
  catchAsync(async (req, res, next) => {
    // On crée la variable 'query' avec la requête (sans le 'populate')
    let query = Model.findById(req.params.id);
    // on ajoute l'option 'populate' si elle existe
    if (populateOption) query = query.populate(populateOption);
    // On 'await' la requête (avec ou sans option 'populate')
    const doc = await query;

    if (!doc) {
      return next(
        new AppError(`No document found with this ID (${req.params.id})`, 404)
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

// [hack] On ajoute le filtre pour la route imbriquée (GET 'reviews' on 'tour')
exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Pour permettre la route imbriquée
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    // On passe « filter »
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs
      }
    });
  });
