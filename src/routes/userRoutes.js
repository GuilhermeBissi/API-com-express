const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getUsers
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate
} = require('../middleware/validation');

// @desc    Registrar usuário
// @route   POST /api/users/register
// @access  Public
router.post('/register', validateUserRegistration, registerUser);

// @desc    Login de usuário
// @route   POST /api/users/login
// @access  Public
router.post('/login', validateUserLogin, loginUser);

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, validateUserUpdate, updateUserProfile);

// @desc    Obter todos os usuários (Admin only)
// @route   GET /api/users
// @access  Private/Admin
router.get('/', protect, admin, getUsers);

module.exports = router;