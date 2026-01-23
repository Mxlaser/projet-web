const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération catégories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Le nom est requis" });

    const category = await prisma.category.create({
      data: { name }
    });
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 'P2002') {
        return res.status(400).json({ error: "Cette catégorie existe déjà" });
    }
    res.status(500).json({ error: "Erreur création catégorie" });
  }
};