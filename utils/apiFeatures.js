// On crée une classe pour y mettre les fonctionnalités de filtrage
class APIFeatures {
  // Deux variables sont passées dans le constructeur :
  // 1- la requête de Mongoose ("query")
  // 2- "queryString" qui vient d'Express (de la route) ie: req.query
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  //On crée nos différentes fonctionalités
  filter() {
    // NOTE (AVANT l'encapsulation) : « const queryObj = { ...req.query }; »
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // NOTE (AVANT l'encapsulation) : « let query = Tour.find(JSON.parse(queryStr)); »
    this.query = this.query.find(JSON.parse(queryStr));

    // ‼ On 'return' l'objet pour pouvoir chaîner les méthodes ‼
    return this;
  }

  sort() {
    // NOTE : « req.query » est remplacé par « this.queryString »
    // NOTE : « query » est remplacé par « this.query »
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('_id');
    }

    // ‼ On 'return' l'objet pour pouvoir chaîner les méthodes ‼
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    // ‼ On 'return' l'objet pour pouvoir chaîner les méthodes ‼
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    // ‼ On 'return' l'objet pour pouvoir chaîner les méthodes ‼
    return this;
  }
}

module.exports = APIFeatures;
