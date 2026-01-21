const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('API Gestion Ressources is running...');
});

app.use('/api/auth', authRoutes);

app.use('/api/resources', resourceRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});