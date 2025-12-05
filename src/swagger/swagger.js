const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HR Backend API',
      version: '1.0.0',
      description: 'API documentation for HR backend',
    },
    servers: [{ url: 'http://localhost:4000', description: 'Local server' }],
  },
  apis: ['./src/routes/*.js', './src/models/*.js'], // JSDoc comments will go here
};

const spec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
}

module.exports = setupSwagger;
