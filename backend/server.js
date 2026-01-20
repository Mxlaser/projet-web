const express = require('express');
const cors = require('cors');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Route de test
app.get('/', (req, res) => {
  res.send('API Resource Manager is running 🚀');
});

// Routes API
app.use('/api/resources', resourceRoutes);

// Lancement du serveur (Version standard)
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});