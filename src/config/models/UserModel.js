const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

class UserModel {
  // Buscar todos os usuários
  static async findAll() {
    try {
      const query = 'SELECT id, name, email, created_at, updated_at FROM users ORDER BY created_at DESC';
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Erro ao buscar usuários: ${error.message}`);
    }
  }

  // Buscar usuário por ID
  static async findById(id) {
    try {
      const query = 'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1';
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
  }

  // Buscar usuário por email (incluindo senha para autenticação)
  static async findByEmail(email) {
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await pool.query(query, [email]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao buscar usuário por email: ${error.message}`);
    }
  }

  // Criar novo usuário
  static async create(userData) {
    const { name, email, password } = userData;
    
    try {
      // Verificar se email já existe
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new Error('Email já está em uso');
      }

      // Hash da senha
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = `
        INSERT INTO users (name, email, password) 
        VALUES ($1, $2, $3) 
        RETURNING id, name, email, created_at
      `;
      
      const result = await pool.query(query, [name, email, hashedPassword]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao criar usuário: ${error.message}`);
    }
  }

  // Atualizar usuário
  static async update(id, userData) {
    const { name, email } = userData;
    
    try {
      const query = `
        UPDATE users 
        SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $3 
        RETURNING id, name, email, updated_at
      `;
      
      const result = await pool.query(query, [name, email, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao atualizar usuário: ${error.message}`);
    }
  }

  // Deletar usuário
  static async delete(id) {
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  }

  // Verificar senha
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw new Error(`Erro ao verificar senha: ${error.message}`);
    }
  }

  // Contar total de usuários
  static async count() {
    try {
      const query = 'SELECT COUNT(*) as total FROM users';
      const result = await pool.query(query);
      return parseInt(result.rows[0].total);
    } catch (error) {
      throw new Error(`Erro ao contar usuários: ${error.message}`);
    }
  }
}

module.exports = UserModel;