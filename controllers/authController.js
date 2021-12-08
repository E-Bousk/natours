// On charge « jsonwebtoken »
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// (Avec le token, on va pouvoir connecter l'utilisateur dès qu'il sera enregistré)
exports.signup = catchAsync(async (req, res, next) => {
  // ‼ En récuperant les données de « req.body », l'utilisateur peut aussi s'ajouter le role « admin » (par exemple)
  // AVANT : « const newUser = await User.create(req.body); »
  // Pour éviter cela, on l'enregistre en autorisant seulement les donnnées dont on a besoin ‼
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  // Pour créer le token, on passe en arguments :
  // 1- un 'objet' avec l'ID de l'utilisateur (« payload » = les données qui doivent être stockées dans le token)
  // 2- un 'string' pour le « secret ou clef privée » (ici récupéré depuis le fichier « config.env »)
  // 3- en option : une durée de validation (l'(es) option(s) doit(doivent) être passée(s) comme 'objet')
  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

  res.status(201).json({
    status: 'succes',
    // On envoie le token créé au client
    token,
    data: {
      user: newUser
    }
  });
});
