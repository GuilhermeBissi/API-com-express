const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth');
const {
  validateProductCreation,
  validateProductUpdate
} = require('../middleware/validation');

// @desc    Obter todos os produtos
// @route   GET /api/products
// @access  Public
router.get('/', optionalAuth, getProducts);

// @desc    Obter produtos por categoria
// @route   GET /api/products/category/:category
// @access  Public
router.get('/category/:category', getProductsByCategory);

// @desc    Obter produto por ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', getProductById);

// @desc    Criar novo produto
// @route   POST /api/products
// @access  Private
router.post('/', protect, validateProductCreation, createProduct);

// @desc    Atualizar produto
// @route   PUT /api/products/:id
// @access  Private
router.put('/:id', protect, validateProductUpdate, updateProduct);

// @desc    Deletar produto
// @route   DELETE /api/products/:id
// @access  Private
router.delete('/:id', protect, deleteProduct);

module.exports = router;