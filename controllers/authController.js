const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// On 'enveloppe' la méthode 'async/await' dans notre fonction "catchAsync" (qui gère les erreurs)
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'succes',
    data: {
      user: newUser
    }
  });
});
