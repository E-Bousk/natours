const express = require('express');

// On importe le controlleur des vues
const viewsController = require('../controllers/viewsController');

const router = express.Router();

// On attribut les differentes fonctions du controlleur sur les différentes routes
router.get('/', viewsController.getOverview);
router.get('/tour', viewsController.getTour);

module.exports = router;
