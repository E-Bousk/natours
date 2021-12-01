const Tour = require('./../models/tourModel');

exports.getAllTours = (req, res) => {
  console.log(req.requestTime);
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime
    // results: tours.length,
    // data: {
    //   tours
    // }
  });
};

exports.getTour = (req, res) => {
  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);
  // res.status(200).json({
  //   status: 'success',
  //   data: {
  //     tour
  //   }
  // });
};

// On utilise le "async/await" pour traiter la promesse (au lieu de ".then()/.catch")
// On utilise donc un "try/catch"
exports.createTour = async (req, res) => {
  try {
    // On appelle la méthode "create" directement sur le model lui-même
    // (Équivalent à :
    // [« const newTour = new Tour({xxxxx}); »
    // « newTour.save(); »]
    // où on appellait la méthode "save" sur le document "newTour" (crée depuis le 'model' "Tour"))
    // Cette méthode retourne elle aussi une promesse.
    // On sauvegarde la valeur resultante de la promesse dans la variable "newTour"
    // et on passe les données de la requête POST ("req.body")
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
      // Message avec l'objet "ERR"
      // message: err
      message: 'Invalid data sent!'
    });
  }
};

exports.updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

exports.deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};
