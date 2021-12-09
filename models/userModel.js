// On charge le module intégré pour crypter le token de réinitialisation de mot de passe
const crypto = require('crypto');

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
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
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
  passwordChangedAt: Date,
  // On crée deux nouveaux champs pour la réinitialisation du mot de passe
  // un pour le token créé afin de pouvoir le comparer avec celui que renvera l'utilisateur
  // au moment où il voudra changer son MDP
  passwordResetToken: String,
  // Un pour définir un date (temps) de validité
  passwordResetExpires: Date
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

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// on crée pour une methode d'instance pour générer aléatoirement un token de réinitialisation de mot de passe
userSchema.methods.createPasswordResetToken = function() {
  // On génère aléatoirement une chaîne de caractère
  const resetToken = crypto.randomBytes(32).toString('hex');

  // On 'hash' pour enregistrer le token dans la BDD
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log('💥💥 resetToken 💥💥 ', resetToken);
  console.log('💥💥 this.passwordResetToken 💥💥 ', this.passwordResetToken);

  // On lui définit une validité dans le temps (ici réglé sur : création + 10 minutes en millisecondes)
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // on retourne le token non chiffré afin de l'envoyé par email
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
