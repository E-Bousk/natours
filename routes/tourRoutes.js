const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// ce « Param middleware » ne fonctionnera que sur les routes avec un paramètre (ici : l'ID)
// Il permet d'éviter de dupliquer du code (contrôle de l'ID) sur les routes le nécessitant
router.param('id', tourController.checkID);

router
  .route('/')
  .get(tourController.getAllTours)
  // On enchaîne les middlewares ... checkBody d'abord, puis createTour ensuite
  .post(tourController.checkBody, tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
