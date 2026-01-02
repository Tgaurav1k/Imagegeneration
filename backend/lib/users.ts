/**
 * User management utilities
 * For production, consider using a proper authentication library
 */

import { getPool } from './db';
import { validateString } from './validation';
import * as crypto from 'crypto';

export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
}

/**
 * Hash password using SHA-256 (for demo - use bcrypt in production)
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify password
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Create a new user
 */
export async function createUser(email: string, password: string, name?: string) {
  const pool = getPool();
  try {
    const validatedEmail = validateString(email, 255);
    const validatedName = name ? validateString(name, 100) : null;
    const passwordHash = hashPassword(password);
    
    const client = await pool.connect();
    
    const result = await client.query(
      `INSERT INTO users (email, password_hash, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, name, created_at, updated_at`,
      [validatedEmail, passwordHash, validatedName]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'User with this email already exists',
      };
    }
    
    return {
      success: true,
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at,
        updated_at: result.rows[0].updated_at,
      },
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Authenticate user
 */
export async function authenticateUser(email: string, password: string) {
  const pool = getPool();
  try {
    const validatedEmail = validateString(email, 255);
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1',
      [validatedEmail]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    const user = result.rows[0];
    const isValid = verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }
    
    // Update last login
    await updateLastLogin(user.id);
    
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at,
      },
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(userId: number) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    await client.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [userId]
    );
    client.release();
  } catch (error) {
    console.error('Error updating last login:', error);
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: number) {
  const pool = getPool();
  try {
    const client = await pool.connect();
    
    const result = await client.query(
      'SELECT id, email, name, created_at, updated_at, last_login FROM users WHERE id = $1',
      [userId]
    );
    
    client.release();
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'User not found',
      };
    }
    
    return {
      success: true,
      data: result.rows[0],
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
