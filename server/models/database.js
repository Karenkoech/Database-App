import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import dotenv from 'dotenv';
import fs from 'fs';

const require = createRequire(import.meta.url);
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database/audit_results.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

let db;

export function initDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
        reject(err);
      } else {
        console.log('✅ Connected to SQLite database');
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

function createTables() {
  return new Promise((resolve, reject) => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        full_name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Create analysis_results table with user_id
      db.run(`
        CREATE TABLE IF NOT EXISTS analysis_results (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          filename TEXT NOT NULL,
          db_type TEXT,
          script_content TEXT,
          ai_analysis TEXT,
          risk_assessment TEXT,
          timestamp TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          // Create default admin user if it doesn't exist
          createDefaultUser().then(() => resolve()).catch(reject);
        }
      });
    });
  });
}

async function createDefaultUser() {
  return new Promise((resolve, reject) => {
    const bcrypt = require('bcrypt');
    const defaultPassword = 'admin123'; // Change this in production!
    bcrypt.hash(defaultPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.warn('Could not hash password:', err);
        resolve();
        return;
      }
      
      db.run(`
        INSERT OR IGNORE INTO users (username, email, password_hash, full_name)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@dbaudit.com', hashedPassword, 'Administrator'], (err) => {
        if (err) {
          console.warn('Could not create default user:', err);
        } else {
          console.log('✅ Default admin user created (username: admin, password: admin123)');
        }
        resolve();
      });
    });
  });
}

export function saveAnalysisResult(data) {
  return new Promise((resolve, reject) => {
    const stmt = db.prepare(`
      INSERT INTO analysis_results 
      (user_id, filename, db_type, script_content, ai_analysis, risk_assessment, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.userId || null,
      data.filename,
      data.dbType || null,
      data.scriptContent,
      JSON.stringify(data.aiAnalysis),
      JSON.stringify(data.riskAssessment),
      data.timestamp,
      function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      }
    );

    stmt.finalize();
  });
}

export function getAnalysisResult(id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM analysis_results WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          if (row) {
            resolve({
              ...row,
              aiAnalysis: JSON.parse(row.ai_analysis),
              riskAssessment: JSON.parse(row.risk_assessment)
            });
          } else {
            resolve(null);
          }
        }
      }
    );
  });
}

export function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

export function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT id, username, email, full_name, created_at FROM users WHERE id = ?',
      [id],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

export function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE email = ?',
      [email],
      (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row || null);
        }
      }
    );
  });
}

export function createUser(userData) {
  return new Promise((resolve, reject) => {
    try {
      const bcrypt = require('bcrypt');
      const { username, email, password, fullName } = userData;
      
      if (!username || !email || !password) {
        reject(new Error('Missing required fields'));
        return;
      }
      
      // Hash password
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Bcrypt hash error:', err);
          reject(new Error('Failed to hash password'));
          return;
        }
        
        if (!db) {
          reject(new Error('Database not initialized'));
          return;
        }
        
        db.run(
          'INSERT INTO users (username, email, password_hash, full_name) VALUES (?, ?, ?, ?)',
          [username, email, hashedPassword, fullName || null],
          function(err) {
            if (err) {
              console.error('Database insert error:', err);
              if (err.message && err.message.includes('UNIQUE constraint')) {
                if (err.message.includes('username')) {
                  reject(new Error('Username already exists'));
                } else if (err.message.includes('email')) {
                  reject(new Error('Email already exists'));
                } else {
                  reject(new Error('User already exists'));
                }
              } else {
                reject(err);
              }
            } else {
              resolve({
                id: this.lastID,
                username,
                email,
                fullName: fullName || null
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('createUser error:', error);
      reject(error);
    }
  });
}

export function getUserAnalysisHistory(userId, dbType = null) {
  return new Promise((resolve, reject) => {
    let query = 'SELECT * FROM analysis_results WHERE user_id = ?';
    const params = [userId];
    
    if (dbType) {
      query += ' AND db_type = ?';
      params.push(dbType);
    }
    
    query += ' ORDER BY created_at DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        const results = rows.map(row => {
          try {
            return {
              ...row,
              aiAnalysis: row.ai_analysis ? JSON.parse(row.ai_analysis) : null,
              riskAssessment: row.risk_assessment ? JSON.parse(row.risk_assessment) : null
            };
          } catch (parseError) {
            // If JSON parsing fails, return with raw strings
            console.warn('Failed to parse JSON for row:', row.id, parseError);
            return {
              ...row,
              aiAnalysis: row.ai_analysis || null,
              riskAssessment: row.risk_assessment || null
            };
          }
        });
        resolve(results);
      }
    });
  });
}
