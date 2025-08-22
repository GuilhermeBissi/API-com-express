const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [50, 'Nome não pode ter mais de 50 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false // Por padrão não retorna a senha nas consultas
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  avatar: {
    type: String,
    default: null
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Cria automaticamente createdAt e updatedAt
});

// Index para melhorar performance nas buscas
userSchema.index({ email: 1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  // Só executa se a senha foi modificada
  if (!this.isModified('password')) return next();
  
  // Hash da senha com salt 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para retornar dados públicos do usuário
userSchema.methods.toPublicJSON = function() {
  const userObj = this.toObject();
  delete userObj.password;
  return userObj;
};

// Virtual para URL do avatar
userSchema.virtual('avatarUrl').get(function() {
  return this.avatar ? `${process.env.BASE_URL}/uploads/avatars/${this.avatar}` : null;
});

// Incluir virtuals no JSON
userSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', userSchema);