// On charge le module intégré pour chiffrer le token de réinitialisation de mot de passe
const crypto = require('crypto');

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// On importe notre fonction pour envoyer des emails
const sendEmail = require('./../utils/email');

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

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You are not allowed to perform this action', 403)
      );
    }
    next();
  };
};

// Fonctionalité pour réinitialiser le mot de passe
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) On récupère l'utilisateur par son email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with this email address', 404));
  }

  // 2) On génère aléatoirement un token de réinitialisation
  // on a créé pour cela une methode d'instance dans le 'model' 'user' (« createPasswordResetToken »)
  const resetToken = user.createPasswordResetToken();
  // On désactive les validations pour pouvoir sauvegarder dans la BDD sans les champs requis
  await user.save({ validateBeforeSave: false });

  // 3) On renvoie le token à l'utilisateur via son email
  // On crée le lien avec le token
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  // On crée le message à envoyer
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you did not, please ignore this email!`;

  // EN CAS D'ERREUR avec « sendEmail » :
  // On ajoute un bloc 'try/catch' ici, car on veut plus qu'un simple message envoyé au client
  // par notre gestionnaire d'erreur (middleware "catchAsync") :
  // On doit redéfinir le « passwordResetToken » et le « passwordResetExpires »
  try {
    // On envoie le mail avec notre fonction « sendEmail » (qui est asynchrone donc : AWAIT)
    await sendEmail({
      email: req.body.email, // ou « email: user.email »
      subject: 'Your password reset token (only valid for 10 min)',
      message
    });

    // Nécéssaire : On envoie une réponse sinon le cycle requête/réponse ne finit pas
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    // On efface le « passwordResetToken » et le « passwordResetExpires »
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // On écrase dans la BDD
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) On récupére l'utilisateur

  // On chiffre (de la même manière que lors de la création)
  // le token passé en paramètre de l'URL (« req.params.token »)
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  // On récupère l'utilisateur par son token (« findOne » avec « hashedToken »)
  // et on vérifie que le token n'a pas expiré (« $gt » = greater than)
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // 2) uniquement si le token n'a pas expiré et que l'utilisateur est trouvé
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // On définit le nouveau MDP
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  // On efface les champs « passwordResetToken » et « passwordResetExpires »
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // on sauvegarde dans la BDD
  await user.save();

  // 3) On met à jour le champ « passwordChangedAt » de l'utilisateur
  // On utilise un middleware dans 'UserModel'

  // 4) On connecte l'utilisateur : on créer/envoie un token JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token
  });
});
