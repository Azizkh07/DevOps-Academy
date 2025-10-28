-- Migration: Add session tracking to users table
-- This enables single-device login enforcement (like WhatsApp/Tinder)
-- Run this SQL on your cPanel MySQL database

-- Add session_token column to track active sessions
ALTER TABLE users ADD COLUMN session_token VARCHAR(255) DEFAULT NULL;

-- Add last_activity column to track when user was last active
ALTER TABLE users ADD COLUMN last_activity TIMESTAMP NULL DEFAULT NULL;

-- Add index for faster session lookups
CREATE INDEX idx_session_token ON users(session_token);

-- Add comment for documentation
ALTER TABLE users COMMENT = 'Users table with session-based single device login support';

-- Show the updated table structure
DESCRIBE users;
