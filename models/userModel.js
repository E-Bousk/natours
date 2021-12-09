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
  },
  // On ajoute un champ pour créer une date lors d'un changement de MDP
  passwordChangedAt: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// On crée une "instance method" (une méthode qui sera valable dans tous les documents)
// (les documents sont des instances du 'model')
// Dans cette fonction, on passe le timestamp de JWT (de la création du token)
// pour le comparer à la date (eventuelle) du changement du MDP
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    // On convertit la date du changement du MDP en timestamp
    const changedTimestamp = parseInt(
      // on passe de milliseconde à seconde
      this.passwordChangedAt.getTime() / 1000,
      // optionnel : base 10
      10
    );

    // console.log('💥 this.passwordChangedAt 💥 ==> ', this.passwordChangedAt);
    // console.log('💥💥 changedTimestamp 💥💥 ==> ', changedTimestamp);
    // console.log('💥💥 JWTTimestamp 💥💥 ==> ', JWTTimestamp);

    // on retourne 'faux' si pas de changement de MDP après création du token
    return JWTTimestamp < changedTimestamp;
  }
  // Par défaut on retourne 'faux'
  // qui signifie que l'utilisateur n'a pas changé de MDP après la création du token
  return false;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
