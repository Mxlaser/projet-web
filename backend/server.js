const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 3000;

const resourceRoutes = require('./routes/resourceRoutes');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire';

app.use(cors());
app.use(express.json());

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: "Email/Pwd requis" });
        
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ error: "Email pris" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({ data: { email, password: hashedPassword } });
        res.status(201).json({ message: "User created", user: { id: user.id, email: user.email } });
    } catch (e) { res.status(500).json({ error: "Erreur inscription" }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: "Invalide" });
        }
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email } });
    } catch (e) { res.status(500).json({ error: "Erreur login" }); }
});


app.use('/api/resources', resourceRoutes);


app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});