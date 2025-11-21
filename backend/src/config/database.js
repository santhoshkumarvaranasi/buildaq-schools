/**
 * Database configuration and connection management
 * Supports multiple database types with environment-based configuration
 */

const path = require('path');
const fs = require('fs').promises;

class Database {
  constructor() {
    this.connection = null;
    this.type = process.env.DB_TYPE || 'mock';
    this.config = this.getConfig();
  }

  getConfig() {
    switch (this.type.toLowerCase()) {
      case 'mongodb':
        return {
          uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/schooldb',
          options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
          }
        };
      
      case 'mysql':
        return {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'schooldb',
        };
      
      case 'postgresql':
        // Support SSL options via environment variables (DB_SSL or PGSSLMODE)
        const enableSsl = (process.env.DB_SSL === 'true') || (process.env.PGSSLMODE === 'require') || false;
        const sslReject = process.env.DB_SSL_REJECT !== 'false';
        const pgConfig = {
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || '',
          database: process.env.DB_NAME || 'schooldb',
        };
        if (enableSsl) {
          // The `pg` client accepts `ssl` as an object or boolean. Provide an object
          // that allows disabling certificate verification when needed (useful for
          // some managed DBs or local cert setups). Default is to verify certificates.
          pgConfig.ssl = { rejectUnauthorized: sslReject };
        }
        return pgConfig;
      
      case 'sqlite':
        return {
          filename: process.env.DB_FILENAME || path.join(__dirname, '..', '..', 'data', 'school.db')
        };
      
      default:
        return {}; // Mock database
    }
  }

  async connect() {
    try {
      switch (this.type.toLowerCase()) {
        case 'mongodb':
          await this.connectMongoDB();
          break;
        
        case 'mysql':
          await this.connectMySQL();
          break;
        
        case 'postgresql':
          await this.connectPostgreSQL();
          break;
        
        case 'sqlite':
          await this.connectSQLite();
          break;
        
        default:
          await this.connectMock();
      }

      console.log(`✅ Connected to ${this.type} database`);
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed (${this.type}):`, error.message);
      throw error;
    }
  }

  async connectMongoDB() {
    const mongoose = require('mongoose');
    await mongoose.connect(this.config.uri, this.config.options);
    this.connection = mongoose.connection;
  }

  async connectMySQL() {
    const mysql = require('mysql2/promise');
    this.connection = await mysql.createConnection(this.config);
  }

  async connectPostgreSQL() {
    const { Client } = require('pg');
    this.connection = new Client(this.config);
    await this.connection.connect();
  }

  async connectSQLite() {
    const sqlite3 = require('sqlite3').verbose();
    const { open } = require('sqlite');
    
    // Ensure directory exists
    const dir = path.dirname(this.config.filename);
    await fs.mkdir(dir, { recursive: true });
    
    this.connection = await open({
      filename: this.config.filename,
      driver: sqlite3.Database
    });
  }

  async connectMock() {
    // Mock database for testing/development
    this.connection = {
      query: async (sql, params) => {
        console.log('Mock query:', sql, params);
        return { rows: [], rowCount: 0 };
      },
      close: async () => {
        console.log('Mock database connection closed');
      }
    };
    
    console.log('🔧 Using mock database for development');
  }

  async disconnect() {
    if (!this.connection) return;

    try {
      switch (this.type.toLowerCase()) {
        case 'mongodb':
          await this.connection.close();
          break;
        
        case 'mysql':
          await this.connection.end();
          break;
        
        case 'postgresql':
          await this.connection.end();
          break;
        
        case 'sqlite':
          await this.connection.close();
          break;
        
        default:
          await this.connection.close();
      }

      console.log(`✅ Disconnected from ${this.type} database`);
    } catch (error) {
      console.error(`❌ Error disconnecting from database:`, error.message);
    } finally {
      this.connection = null;
    }
  }

  async query(sql, params = []) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }

    try {
      switch (this.type.toLowerCase()) {
        case 'mongodb':
          // MongoDB uses different query methods
          throw new Error('Use MongoDB models for queries');
        
          case 'mysql':
            // mysql2/promise returns [rows, fields]
            const [mysqlRows] = await this.connection.execute(sql, params);
            return mysqlRows;

          case 'postgresql':
            // pg Client returns { rows }
            const pgResult = await this.connection.query(sql, params);
            return pgResult.rows;
        
        case 'sqlite':
          return await this.connection.all(sql, params);
        
        default:
          return await this.connection.query(sql, params);
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnected() {
    return this.connection !== null;
  }
}

// Create singleton instance
const database = new Database();

module.exports = database;