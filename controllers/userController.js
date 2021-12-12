const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

const filterObjet = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Pour qu'un utilisateur puisse accèder à ses (propres) données :
// On crée un middleware exécuté avant « getOne » du "handlerFactory"
exports.getMe = (req, res, next) => {
  // l'ID venait des paramètres de la route. Ici il vient de l'utilisateur connecté (avec « protect » de « authController »)
  // on assigne donc « req.params.id » avec « req.user.id » pour le « findById » de « getOne »
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cannot update your password here. Please use « /updateMyPassword » instead',
        400
      )
    );
  }

  const filteredBody = filterObjet(req.body, 'name', 'email');

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message:
      'This route « createUser » is not yet defined. Please use /signup instead'
  });
};

exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// ‼ Ne pas mettre à jour le mot de passe avec ceci ‼
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
