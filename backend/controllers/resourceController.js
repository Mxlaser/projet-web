const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Créer une ressource
exports.createResource = async (req, res) => {
  try {
    // Note : Pour l'instant on passe userId "en dur" dans le body
    // Plus tard, on le récupérera via le token d'auth (req.user.id)
    const { title, type, content, userId } = req.body;

    const resource = await prisma.resource.create({
      data: {
        title,
        type,      // "LINK", "NOTE", etc.
        content,   // C'est un objet JSON, Prisma gère ça tout seul
        userId: parseInt(userId) // On s'assure que c'est bien un nombre
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la création de la ressource" });
  }
};

// 2. Récupérer toutes les ressources
exports.getAllResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: {
        createdAt: 'desc' // Les plus récentes en premier
      }
    });
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des ressources" });
  }
};

// 3. Récupérer une seule ressource par ID
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const resource = await prisma.resource.findUnique({
      where: { id: parseInt(id) }
    });

    if (!resource) {
      return res.status(404).json({ error: "Ressource non trouvée" });
    }

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

// 4. Mettre à jour une ressource
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content } = req.body;

    const updatedResource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: { title, type, content }
    });

    res.json(updatedResource);
  } catch (error) {
    // Code P2025 = Enregistrement introuvable chez Prisma
    if (error.code === 'P2025') {
       return res.status(404).json({ error: "Ressource non trouvée" });
    }
    res.status(500).json({ error: "Impossible de mettre à jour" });
  }
};

// 5. Supprimer une ressource
exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.resource.delete({
      where: { id: parseInt(id) }
    });
    res.json({ message: "Ressource supprimée avec succès" });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Ressource non trouvée" });
   }
    res.status(500).json({ error: "Impossible de supprimer" });
  }
};