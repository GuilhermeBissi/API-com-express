const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Middleware de tratamento de erros
const errorHandler = (error, req, res, next) => {
  console.error('Erro capturado:', error);

  // Erro de validação do Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  // Erro do PostgreSQL
  if (error.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return res.status(409).json({
          success: false,
          message: 'Recurso já existe'
        });
      case '23503': // foreign_key_violation
        return res.status(400).json({
          success: false,
          message: 'Violação de chave estrangeira'
        });
      case '23502': // not_null_violation
        return res.status(400).json({
          success: false,
          message: 'Campo obrigatório não fornecido'
        });
    }
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Middleware para rota não encontrada
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Rota ${req.method} ${req.originalUrl} não encontrada`
  });
};

// Middleware para rate limiting simples (em produção use redis)
const rateLimit = () => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutos
    const maxRequests = 100; // máximo de requisições por janela

    if (!requests.has(ip)) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const requestInfo = requests.get(ip);

    if (now > requestInfo.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (requestInfo.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Muitas requisições. Tente novamente em alguns minutos.',
        retryAfter: Math.ceil((requestInfo.resetTime - now) / 1000)
      });
    }

    requestInfo.count++;
    next();
  };
};

module.exports = {
  setupMiddleware: (app) => {
    // Middlewares de segurança
    app.use(helmet());
    
    // CORS
    app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') 
        : true,
      credentials: true
    }));

    // Parse do body
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Trust proxy (para rate limiting e IP)
    app.set('trust proxy', 1);

    // Rate limiting
    app.use(rateLimit());

    // Log de requisições em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}`);
        next();
      });
    }
  },
  errorHandler,
  notFound
};