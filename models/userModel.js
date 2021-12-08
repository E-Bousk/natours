const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Please, tell us your name!']
  },
  email: {
    type: String,
    required: [true, 'Please, provide your email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please, provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    trim: true,
    required: [true, 'Please provide a password'],
    minLength: [8, 'Your password cannot be less then 8 characters'],
    // Pour ne jamais afficher le mot de passe lors de la restitution des données
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password;
      },
      message: 'Passwords are not matching!'
    }
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// « Instance method » = méthode valable sur tous les documents d'une certaine collection
// Fonction pour vérifier si le MDP donné est le même que celui dans la BDD
userSchema.methods.correctPassword = async function(
  // (le MDP passé dans le body)
  candidatePassword,
  // (NOTE: on ne peut pas utiliser "this.password" car on a définit « select: false » dans le schema)
  userPassword
) {
  // retourne vrai ou faux
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
