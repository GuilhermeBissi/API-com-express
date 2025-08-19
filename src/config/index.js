const express = require('express');
require('dotenv').config();

// Importar configurações
const { testConnection, createTables } = require('./config/db');
const { setupMiddleware, errorHandler, notFound } = require('./middleware');

// Importar rotas
const userRoutes = require('./routes/userRoutes');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar middlewares
setupMiddleware(app);

// Rota de saúde/status da API
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users'
    },
    documentation: 'Consulte o README.md para mais informações'
  });
});

// Configurar rotas da API
app.use('/api/users', userRoutes);

// Middleware para rotas não encontradas
app.use(notFound);

// Middleware de tratamento de erros
app.use(errorHandler);

// Função para inicializar o servidor
const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Testar conexão com banco
    await testConnection();
    
    // Criar tabelas se necessário
    await createTables();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🌟 Servidor rodando na porta ${PORT}`);
      console.log(`📍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 URL: http://localhost:${PORT}`);
      console.log(`💾 Health check: http://localhost:${PORT}/health`);
      console.log(`👥 API Users: http://localhost:${PORT}/api/users`);
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  console.error('Em:', promise);
  process.exit(1);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n📢 Recebido ${signal}. Fechando servidor graciosamente...`);
  
  // Fechar conexões do banco
  // pool.end() - se necessário
  
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Iniciar servidor
startServer();