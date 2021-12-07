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
    minLength: [8, 'Your password cannot be less then 8 characters']
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    // On crée une validation avec une fonction et un message, donc on ouvre un nouvel objet
    validate: {
      // [NE FONCTIONNE QUE SUR ".create()" ET ".save()" donc si on doit mettre à jour,
      // il faut utiliser "SAVE" à nouveau et pas "findOneAndUpdate" par exemple.]
      // On fait une fonction callback appelée quand un nouveau document est crée
      // NOTE: ‼ pas de fonction flechée pour pouvoir utiliser le mot-clef "this" ‼
      validator: function(el) {
        // (Si on retourne "faux" on a une erreur de validation)
        return el === this.password;
      },
      message: 'Passwords are not matching!'
    }
  }
});

// Mongoose Middleware "pre-save" pour encoder les mots de passe
// (entre le moment où on reçoit les données et celui où on les inscrit dans la BDD)
userSchema.pre('save', async function(next) {
  // uniquement si le mdp change (update) ou s'il est crée (nouveau)
  // donc si le mdp n'est pas modifié, on sort du middleware
  if (!this.isModified('password')) return next();

  // encode le mdp avec un 'coût' de 12
  this.password = await bcrypt.hash(this.password, 12);

  // On n'a plus besoin de ce champ, et on ne le veut pas dans la BDD
  // (Note: le "required" fonctionne pour l'input, pas pour le persistement en BDD)
  this.passwordConfirm = undefined;

  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
