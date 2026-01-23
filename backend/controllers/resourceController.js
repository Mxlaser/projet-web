const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createResource = async (req, res) => {
  try {
    const { title, type, categoryId, tags, createdAt } = req.body;
    const userId = req.user.userId;

    let contentData = req.body.content;

    if (typeof contentData === 'string') {
      try {
        contentData = JSON.parse(contentData);
      } catch(e) {
        console.error("Erreur de parsing JSON:", e);
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

    // Permettre de définir une date de création personnalisée
    let createdAtDate = createdAt ? new Date(createdAt) : undefined;
    if (createdAtDate && isNaN(createdAtDate.getTime())) {
      createdAtDate = undefined; // Date invalide, utiliser la date par défaut
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        type,
        content: contentData,
        userId,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: { connectOrCreate: tagsToConnect },
        ...(createdAtDate && { createdAt: createdAtDate })
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
  
exports.updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    let { title, type, content, categoryId, tags } = req.body;

    const existingResource = await prisma.resource.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingResource) return res.status(404).json({ error: "Ressource introuvable" });

    let contentData = content;
    if (typeof contentData === 'string') {
      try {
        contentData = JSON.parse(contentData);
      } catch(e) {
        console.error(e);
        contentData = {};
      }
    }
    
    if (!contentData || typeof contentData !== 'object') {
      contentData = existingResource.content && typeof existingResource.content === 'object' 
        ? { ...existingResource.content } 
        : {};
    }

    if (req.file) {
      contentData = {
        ...contentData,
        fileUrl: `/uploads/${req.file.filename}`,
        originalName: req.file.originalname
      };
    } else if (existingResource.content && typeof existingResource.content === 'object') {
      if (existingResource.content.fileUrl) {
        contentData.fileUrl = existingResource.content.fileUrl;
      }
      if (existingResource.content.originalName) {
        contentData.originalName = existingResource.content.originalName;
      }
    }

    let tagsArray = tags;
    if (typeof tags === 'string') {
      try {
        tagsArray = JSON.parse(tags);
      } catch(e) {
        console.error(e);
        tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    }

    const tagConnect = tagsArray ? tagsArray.map(t => ({
        where: { name: t },
        create: { name: t }
    })) : undefined;

    const updatedResource = await prisma.resource.update({
      where: { id: parseInt(id) },
      data: {
        title,
        type,
        content: contentData,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags: tagConnect ? { connectOrCreate: tagConnect } : undefined
      },
      include: { tags: true, category: true }
    });

    res.json(updatedResource);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Erreur suppression" });
  }
};