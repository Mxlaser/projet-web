const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, resourceController.createResource);       // Créer
router.get('/', authMiddleware, resourceController.getAllResources);       // Lire tout
router.get('/:id', authMiddleware, resourceController.getResourceById);    // Lire un
router.put('/:id', authMiddleware, resourceController.updateResource);     // Modifier
router.delete('/:id', authMiddleware, resourceController.deleteResource);  // Supprimer

module.exports = router;