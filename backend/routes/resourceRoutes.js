const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');

router.post('/', resourceController.createResource);       // Créer
router.get('/', resourceController.getAllResources);       // Lire tout
router.get('/:id', resourceController.getResourceById);    // Lire un
router.put('/:id', resourceController.updateResource);     // Modifier
router.delete('/:id', resourceController.deleteResource);  // Supprimer

module.exports = router;