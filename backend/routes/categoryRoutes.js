const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lister toutes les catégories disponibles
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catégories (ID et nom)
 *   post:
 *     summary: Créer une nouvelle catégorie
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nom de la catégorie (ex Travail, Perso)
 *     responses:
 *       201:
 *         description: Catégorie créée avec succès
 */
router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);

module.exports = router;