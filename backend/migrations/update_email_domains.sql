-- Migration: Update email domains from cliniquejuriste.com to devopsacademy.com
-- Date: 2025-12-28

-- Update admin email
UPDATE users 
SET email = 'admin@devopsacademy.com' 
WHERE email = 'admin@cliniquejuriste.com';

-- Update sami email
UPDATE users 
SET email = 'sami@devopsacademy.com' 
WHERE email = 'sami@cliniquejuriste.com';

-- Update rami email
UPDATE users 
SET email = 'rami@devopsacademy.com' 
WHERE email = 'rami@cliniquejuriste.com';

-- Update any other emails with old domain
UPDATE users 
SET email = REPLACE(email, '@cliniquejuriste.com', '@devopsacademy.com')
WHERE email LIKE '%@cliniquejuriste.com';

-- Verify the changes
SELECT id, name, email, is_admin FROM users;
