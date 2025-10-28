/**
 * Database Migration Runner
 * Adds session_token and last_activity columns to users table
 * 
 * Usage: node run-migration.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🔧 Starting database migration...\n');
  
  // Parse DATABASE_URL if it exists, otherwise use individual vars
  let config;
  
  if (process.env.DATABASE_URL) {
    // Parse DATABASE_URL: mysql://user:password@host:port/database
    const dbUrl = process.env.DATABASE_URL;
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    
    if (match) {
      config = {
        host: match[3],
        port: parseInt(match[4]),
        user: match[1],
        password: match[2],
        database: match[5]
      };
      console.log('📊 Using DATABASE_URL configuration');
    } else {
      throw new Error('Invalid DATABASE_URL format');
    }
  } else {
    // Use individual environment variables
    config = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'legal_education_mysql5',
      port: process.env.DB_PORT || 3306
    };
    console.log('📊 Using individual DB_* environment variables');
  }

  console.log('📊 Database Configuration:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.user}\n`);

  let connection;
  
  try {
    // Connect to database
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection(config);
    console.log('✅ Connected successfully!\n');

    // Check current table structure
    console.log('🔍 Checking current users table structure...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    
    const columnNames = columns.map(col => col.Field);
    console.log('   Current columns:', columnNames.join(', '));
    
    const hasSessionToken = columnNames.includes('session_token');
    const hasLastActivity = columnNames.includes('last_activity');
    
    console.log(`   ➜ session_token: ${hasSessionToken ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   ➜ last_activity: ${hasLastActivity ? '✓ EXISTS' : '✗ MISSING'}\n`);

    // Add session_token column if missing
    if (!hasSessionToken) {
      console.log('📝 Adding session_token column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN session_token VARCHAR(255) DEFAULT NULL
      `);
      console.log('✅ session_token column added!\n');
    } else {
      console.log('ℹ️  session_token column already exists, skipping...\n');
    }

    // Add last_activity column if missing
    if (!hasLastActivity) {
      console.log('📝 Adding last_activity column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN last_activity TIMESTAMP NULL DEFAULT NULL
      `);
      console.log('✅ last_activity column added!\n');
    } else {
      console.log('ℹ️  last_activity column already exists, skipping...\n');
    }

    // Create index if it doesn't exist
    console.log('📝 Checking for session_token index...');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM users WHERE Key_name = 'idx_session_token'
    `);
    
    if (indexes.length === 0) {
      console.log('📝 Creating index on session_token...');
      await connection.query(`
        CREATE INDEX idx_session_token ON users(session_token)
      `);
      console.log('✅ Index created!\n');
    } else {
      console.log('ℹ️  Index already exists, skipping...\n');
    }

    // Verify final structure
    console.log('🔍 Verifying final table structure...');
    const [finalColumns] = await connection.query(`
      SHOW COLUMNS FROM users
    `);
    
    console.log('\n📋 Final users table structure:');
    console.log('   ID | Field              | Type           | Null | Key | Default');
    console.log('   ---|--------------------|--------------  |------|-----|--------');
    finalColumns.forEach((col, idx) => {
      console.log(`   ${String(idx + 1).padEnd(2)} | ${col.Field.padEnd(18)} | ${col.Type.padEnd(14)} | ${col.Null.padEnd(4)} | ${(col.Key || '').padEnd(3)} | ${col.Default || 'NULL'}`);
    });

    // Show statistics
    console.log('\n📊 Current Statistics:');
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(session_token) as users_with_session,
        COUNT(last_activity) as users_with_activity
      FROM users
    `);
    
    console.log(`   Total users: ${stats[0].total_users}`);
    console.log(`   Users with active session: ${stats[0].users_with_session}`);
    console.log(`   Users with recent activity: ${stats[0].users_with_activity}`);

    console.log('\n✅ Migration completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Restart your backend server');
    console.log('   2. Test login with single device enforcement');
    console.log('   3. Try uploading large videos with chunked upload\n');

  } catch (error) {
    console.error('\n❌ Migration failed!');
    console.error('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure MySQL server is running!');
      console.error('   - Check XAMPP/WAMP is started');
      console.error('   - Verify DB_HOST, DB_PORT in .env file');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Database access denied!');
      console.error('   - Check DB_USER and DB_PASSWORD in .env file');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n💡 Database does not exist!');
      console.error(`   - Create database: CREATE DATABASE ${config.database};`);
      console.error('   - Or check DB_NAME in .env file');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run migration
runMigration();
