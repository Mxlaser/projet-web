const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const authMiddleware = require('./middleware/auth');
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Gestion Ressources is running...');
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "Cet email est déjà utilisé" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        });

        res.status(201).json({ 
            message: "Utilisateur créé", 
            user: { id: user.id, email: user.email } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de l'inscription" });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }

        const token = jwt.sign(
            { userId: user.id }, 
            JWT_SECRET,          
            { expiresIn: '24h' } 
        );

        res.json({ 
            token, 
            user: { id: user.id, email: user.email } 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur de connexion" });
    }
});

app.post('/api/resources', authMiddleware, async (req, res) => {
    try {
        const { title, type, content, categoryId, tags } = req.body;
        const userId = req.user.userId; 

        const tagConnect = tags ? tags.map(t => ({
            where: { name: t },
            create: { name: t }
        })) : [];

        const resource = await prisma.resource.create({
            data: {
                title,
                type,
                content,
                userId,
                categoryId,
                tags: {
                    connectOrCreate: tagConnect
                }
            },
            include: {
                tags: true,
                category: true
            }
        });

        res.status(201).json(resource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erreur lors de la création de la ressource" });
    }
});

app.get('/api/resources', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const resources = await prisma.resource.findMany({
            where: { userId },
            include: {
                tags: true,
                category: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: "Impossible de récupérer les ressources" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});