const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig');

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Servir les fichiers statiques depuis le dossier uploads
const uploadsPath = path.join(__dirname, 'uploads');
console.log('Serving static files from:', uploadsPath);

// Vérifier si le dossier existe
const fs = require('fs');
if (!fs.existsSync(uploadsPath)) {
  console.log('Creating uploads directory...');
  fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filePath) => {
    // Définir les en-têtes CORS pour les fichiers statiques
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET');
  }
}));

app.get('/', (req, res) => {
    res.send('API Gestion Ressources is running...');
});

app.use('/api/auth', authRoutes);

app.use('/api/resources', resourceRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});