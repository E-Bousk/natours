const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // *** Pour filter ***

    // *** 1) CONSTRUIT LA REQUÊTE ***

    // // 1er Manière : en utilisant le chaînage de méthodes spéciales (Mangoose)
    // const tours = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals('easy');

    // // 2de Manière : ordinaire (MongoDB query)
    // const tours = await Tour.find({
    //   duration: 5,
    //   difficulty: 'easy'
    // });

    // // Avec « req.query », on récupère, depuis la requête, les champs pour filtrer
    // console.log(req.query);

    // ‼ Pour la pagination (par exemple), il ne faut pas que le paramètre « page=2 » soit recherché dans la BDD
    // Il faut donc exclure ces champs de la requête avant de filtrer. ‼
    // On crée un objet qui contient toutes les paires cléfs-valeurs qui sont dans l'objet "req.query"
    // en "hard copy" plutôt qu'en "shallow copy" [https://www.javascripttutorial.net/object/3-ways-to-copy-objects-in-javascript/]
    // pour cela on utilise d'abord la structure « ... » [https://www.javascripttutorial.net/es-next/javascript-object-spread/]
    // (prend tous les champs de cet objet)
    // et après on crée un nouvel objet de "req.query" avec « {} »
    const queryObj = { ...req.query };
    // On crée un tableau avec tous les champs à exclure
    const excludeFields = ['page', 'sort', 'limit', 'fileds'];
    // On retire tous ces champs de l'objet ("queryObj")
    excludeFields.forEach(el => delete queryObj[el]);

    // console.log(req.query, queryObj);

    // On passe maintenant "queryObj" comme filtre
    // ‼ NOTE : la méthode "find" retourne une requête
    // Dès l'instant que l'on fait un "await", le requête s'execute et renvoie les documents qui correspondent
    // et si on le fait tel quel, il n'y aura pas possibilité d'implementer une pagination (un tri ou autre) par la suite ‼
    // const tours = await Tour.find(queryObj);

    // À la place, on sauvegarde cette partie dans une variable
    // puis, par exemple, on utilisera la méthode "sort", "limit" etc... et on les chaînera à cette requête
    // (ce qui serait impossible si on "await" la requête initiale) et seulement après on "await" cette requête
    const query = Tour.find(queryObj);

    // *** 2) EXECUTE LA REQUÊTE ***
    const tours = await query;

    // *** 3) ENVOIE LA RÉPONSE ***
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
