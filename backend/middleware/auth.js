const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_temporaire';

module.exports = (req, res, next) => {
    try {
        // 1. Récupérer le token dans le header "Authorization: Bearer <token>"
        const token = req.headers.authorization.split(' ')[1];
        
        if (!token) {
            throw new Error('Authentication failed!');
        }

        // 2. Vérifier le token
        const decodedToken = jwt.verify(token, JWT_SECRET);
        
        // 3. Ajouter l'ID utilisateur à la requête pour la suite
        req.user = { userId: decodedToken.userId };
        
        next(); // Tout est bon, on passe à la suite
    } catch (error) {
        res.status(401).json({ error: 'Authentification requise !' });
    }
};