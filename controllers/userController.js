const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// On charge notre classe « AppError »
const AppError = require('./../utils/appError');

// On crée une fonction pour filter uniquement les champs qui sont modifiables par l'utilisateur
// (qui prend un objet et des paramètres pour les champs autorisés ( ce qui crée donc un tableau avec tous les arguments passés))
const filterObjet = (obj, ...allowedFields) => {
  // console.log('💥💥 obj 💥💥 ➡ ', obj);
  // console.log('💥💥 allowedFields 💥💥 ➡ ', allowedFields);
  // On crée un objet vide (qu'on retournera une fois rempli avec les champs autorisés)
  const newObj = {};
  // On boucle sur tous les champs de l'"objet" et pour chaque champs
  // on vérifie s'il est autorisé. S'il l'est, on l'ajoute dans un nouvel objet
  // avec le même nom et la même valeur que dans l'original et on retourne ce nouvel objet
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  // On retourne cet objet
  // console.log('💥💥 newObj 💥💥 ➡ ', newObj);
  return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

//
exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) on crée une erreur si l'utilisateur essaye de mettre à jour le MDP

  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'You cannot update your password here. Please use « /updateMyPassword » instead',
        400
      )
    );
  }

  // 2) On filtre les champs dont on ne veut pas, qui ne sont pas autorisés à être mis à jour

  // On utilise notre fonction « filterObjet » pour ne choisir que les champs
  // autorisés à être mis à jour (on empêche de modifier le champ 'role', par exemple)
  const filteredBody = filterObjet(req.body, 'name', 'email');

  // 3) On met à jour le document utilisateur

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    // Pour nous retourner les données misent à jour au lieu des anciennes
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

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « getUser » is not yet defined.'
  });
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « createUser » is not yet defined.'
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « updateUser » is not yet defined.'
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route « deleteUser » is not yet defined.'
  });
};
