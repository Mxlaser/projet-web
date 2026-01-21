const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Créer une nouvelle ressource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [NOTE, LINK, IMAGE, PDF]
 *               content:
 *                 type: object
 *                 description: Contenu JSON de la ressource
 *               categoryId:
 *                 type: integer
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Ressource créée avec succès
 *       400:
 *         description: Données invalides
 *   get:
 *     summary: Récupérer toutes les ressources (avec filtres optionnels)
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filtrer par type (ex NOTE)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filtrer par ID de catégorie
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle dans le titre
 *     responses:
 *       200:
 *         description: Liste des ressources récupérée
 */
router.post('/', authMiddleware, upload.single('file'), resourceController.createResource);
router.get('/', authMiddleware, resourceController.getAllResources);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Récupérer une ressource par son ID
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID unique de la ressource
 *     responses:
 *       200:
 *         description: Détails de la ressource
 *       404:
 *         description: Ressource non trouvée
 *   put:
 *     summary: Modifier une ressource existante
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: object
 *     responses:
 *       200:
 *         description: Ressource modifiée avec succès
 *   delete:
 *     summary: Supprimer une ressource
 *     tags: [Resources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ressource supprimée
 */
router.get('/:id', authMiddleware, resourceController.getResourceById);
router.put('/:id', authMiddleware, upload.single('file'), resourceController.updateResource);
router.delete('/:id', authMiddleware, resourceController.deleteResource);

module.exports = router;