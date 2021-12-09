// On utilise une fonction intégrée dans Node pour 'promessifier'
// on déstructure l'objet « util » pour prendre « promisify » directement d'« util »
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
    passwordChangedAt: req.body.passwordChangedAt
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
  // 1) On vérifie si le token existe

  // (Note: On définit la variable en dehors du bloc 'if'
  // si on le faisait dans le bloc 'if', on ne pourrait pas l'utiliser en dehors)
  let token;

  // On essaye de récuperer le token depuis les en-têtes  ('Headers')
  // (dans le 'Headers' on met une clef  « Authorization » et la valeur « Bearer xxxxxTOKENxxxxx »)
  // on verifie donc si il y à la clef « Authorization » dans les en-têtes et si sa valeur commence bien par « Bearer »
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Pour récuperer le token, on découpe ('split') la chaîne de caractère au niveau de l'espace
    // et on récupère la deuxième valeur du tableau ("[1]") ainsi créé (par '.split())
    // (et on réassigne la valeur de la variable 'token' déclarée en dehors du bloc)
    token = req.headers.authorization.split(' ')[1];
  }
  // console.log('💥💥 token 💥💥 ==> ', token);

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) On vérifie si le token est valide

  // On "promessifie" cette fonction (avec une fonction intégrée à Node)
  // afin qu'elle nous retourne une promesse pour pouvoir utiliser 'async/await'

  // On passe en 1er le token a verifier, en 2ème la clef secrète,
  // en 3éme une fonction callback appelée dès que la vérification est complète
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // console.log('💥💥 decoded 💥💥 ==> ', decoded);

  // 3) On vérifie si l'utilisateur existe toujours
  // « decoded.id » est l'ID que l'on récupère depuis le token
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // 4) On vérifie si l'utilisateur a changé son MDP après que le token ait été publié
  // On a crée une "instance method" dans le 'userModel.js'
  // (une méthode qui sera valable dans tous les documents)
  // (les documents sont des instances d'un 'model')
  // NOTE: « decoded.iat » est le timestamp (« Issued AT ») de JWT récupéré depuis le token
  // si le MDP a changé, on retourne une erreur (« changedPasswordAfter » retournera 'true')
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again', 401)
    );
  }

  // avec "next" on poursuit donc avec le gestionnaire de route qui suit
  // ce qui signifie qu'on autorise l'accès à cette route protégée
  // on met toutes les données de l'utilisateur dans la requête
  req.user = currentUser;
  next();
});
