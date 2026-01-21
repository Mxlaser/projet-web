const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Gestion Ressources',
      version: '1.0.0',
      description: 'Documentation de l\'API pour le Projet Web',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'Auth',
        description: 'Gestion de l\'authentification',
      },
      {
        name: 'Categories',
        description: 'Gestion des catégories de classement',
      },
      {
        name: 'Resources',
        description: 'Gestion des ressources (Notes, Liens, etc.)',
      },
    ],
  },
  apis: ['./routes/*.js'], 
};

module.exports = swaggerJsdoc(options);