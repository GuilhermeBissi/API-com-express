const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do produto é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [1000, 'Descrição não pode ter mais de 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'Preço é obrigatório'],
    min: [0, 'Preço deve ser positivo']
  },
  category: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: ['electronics', 'clothing', 'books', 'home', 'sports', 'other'],
    lowercase: true
  },
  stock: {
    type: Number,
    required: [true, 'Estoque é obrigatório'],
    min: [0, 'Estoque não pode ser negativo'],
    default: 0
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL da imagem deve ser válida'
    }
  }],
  brand: {
    type: String,
    trim: true,
    maxlength: [50, 'Marca não pode ter mais de 50 caracteres']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  specifications: {
    weight: Number,
    dimensions: {
      height: Number,
      width: Number,
      depth: Number
    },
    color: String,
    material: String
  },
  ratings: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes para melhorar performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ isActive: 1 });

// Virtual para verificar se está em estoque
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual para calcular preço com desconto
productSchema.virtual('discountedPrice').get(function() {
  // Exemplo: 10% de desconto se o estoque for alto
  if (this.stock > 50) {
    return this.price * 0.9;
  }
  return this.price;
});

// Middleware para popular o campo createdBy
productSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'createdBy',
    select: 'name email'
  });
  next();
});

// Incluir virtuals no JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);