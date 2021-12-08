const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// On crée une fonction avec la création de token (factorisation)
const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'succes',
    token,
    data: {
      user: newUser
    }
  });
});

// RAPPEL: le « catchAsync() » sert à éviter le bloc « try/catch »
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) vérifier que l'email et le mdp existent
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  // 2) vérifier que l'utilisateur existe et que le mdp est correct
  // Avec le ".find()", il n'y a pas le MDP (car dans le 'model' il y a « select: false » pour le MDP)
  // il faut donc le demander explicitement avec le « .select('+password') »
  const user = await User.findOne({ email }).select('+password');
  // la méthode « correctPassword » est une méthode d'instance (elle est dans le fichier Usermodel.js)
  // elle est donc valable dans tous les documents "user"
  // (la variable « user » est un document 'user' (c'est le resultat d'une requête du 'model' 'user'))
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) Si tout est OK : envoyer le token au client
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
