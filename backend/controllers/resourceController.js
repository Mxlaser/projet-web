const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createResource = async (req, res) => {
  try {
    const { title, type, categoryId, tags } = req.body;
    const userId = req.user.userId;

    let contentData = req.body.content;

    if (typeof contentData === 'string') {
      try {
        contentData = JSON.parse(contentData);
      } catch(e) {
      }
    }
    
    if (req.file) {
      contentData = {
        ...contentData,
        fileUrl: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname
      };
    }

    let tagsToConnect = [];
    if (tags) {
      const tagList = Array.isArray(tags) ? tags : JSON.parse(tags);
      tagsToConnect = tagList.map(t => ({ where: { name: t }, create: { name: t } }));
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        content: contentData,
        userId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: { connectOrCreate: tagsToConnect }
      },
      include: { tags: true, category: true }
    });

    res.status(201).json(resource);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur création ressource" });
  }
};

exports.getAllResources = async (req, res) => {
  try {
    const userId = req.user.userId;

    const resources = await prisma.resource.findMany({
      where: { userId },
      include: {
        tags: true,
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
  
exports.getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resource = await prisma.resource.findFirst({
      where: { 
        id: parseInt(id), 
        userId 
      },
      include: {
        tags: true,
        category: true
      }
    });

    if (!resource) return res.status(404).json({ error: "Ressource introuvable" });

    res.json(resource);
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
  
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const { title, type, content, categoryId, tags } = req.body;

    const existingResource = await prisma.resource.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingResource) return res.status(404).json({ error: "Ressource introuvable" });

    const tagConnect = tags ? tags.map(t => ({
        where: { name: t },
        create: { name: t }
    })) : undefined;

    const updatedResource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        content,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags: tags ? { connectOrCreate: tagConnect } : undefined
      },
      include: { tags: true, category: true }
    });

    res.json(updatedResource);
  } catch (error) {
    res.status(500).json({ error: "Erreur mise à jour" });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const result = await prisma.resource.deleteMany({
      where: { 
        id: parseInt(id), 
        userId 
      }
    });

    if (result.count === 0) return res.status(404).json({ error: "Ressource introuvable" });

    res.json({ message: "Supprimé avec succès" });
  } catch (error) {
    res.status(500).json({ error: "Erreur suppression" });
  }
};