// On crée une fonction qui va retourner une fonction pour factoriser le CRUD

const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// EX: avec la fonction async « delete »
// On passe le 'model' et on crée une nouvelle fonction qui va retourner notre fonction async
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
