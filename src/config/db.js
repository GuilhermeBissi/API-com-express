const { Pool } = require('pg');
require('dotenv').config();

// Configuração da conexão com PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  // Configurações adicionais
  max: 20, // máximo de conexões no pool
  idleTimeoutMillis: 30000, // tempo limite para conexões ociosas
  connectionTimeoutMillis: 2000, // tempo limite para conectar
});

// Função para testar a conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    client.release();
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error.message);
    process.exit(1);
  }
};

// Função para criar tabelas (se necessário)
const createTables = async () => {
  try {
    const client = await pool.connect();
    
    // Criação da tabela de usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelas criadas/verificadas com sucesso!');
    client.release();
  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error.message);
  }
};

// Event listeners para o pool
pool.on('connect', () => {
  console.log('🔗 Nova conexão estabelecida com o banco de dados');
});

pool.on('error', (err) => {
  console.error('❌ Erro inesperado no cliente do banco:', err);
  process.exit(-1);
});

module.exports = {
  pool,
  testConnection,
  createTables
};