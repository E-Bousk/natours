const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role
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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  req.user = currentUser;
  next();
});

// On doit passer des arguments dans cette fonction middleware (le(s) role(s) désiré(s))
// pour ce faire, on crée une fonction qui va envelopper et retourner le middleware que l'on veut créer
exports.restrictTo = (...roles) => {
  // ceci est la fonction middleware en elle-même (sans le "return") : elle a maintenant accès à « roles » (grâce à la 'closure')
  return (req, res, next) => {
    // "roles" est un tableau (ex: ['admin', 'lead-guide'])
    // on vérifie donc si le role de l'utilisateur est présent dans le tableau du(des) role(s) autorisé(s)
    // NOTE: ‼ on a accès à l'utilisateur car on l'a stocké dans la requête avec « req.user = currentUser »
    // dans le middleware appelé juste avant celui-ci (« protect » middleware).
    // On peut donc maintenant récupérer son rôle avec « req.user.role » ‼
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }
    // On passe au middleware suivant (le gestionnaire de la route)
    next();
  };
};
