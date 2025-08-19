const express = require('express');
const UserController = require('../controllers/UserController');

const router = express.Router();

// Middleware para log de requisições (opcional)
router.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Rotas para usuários
router.get('/', UserController.getAll);           // GET /api/users
router.get('/:id', UserController.getById);      // GET /api/users/:id
router.post('/', UserController.create);         // POST /api/users
router.put('/:id', UserController.update);       // PUT /api/users/:id
router.delete('/:id', UserController.delete);    // DELETE /api/users/:id

module.exports = router;