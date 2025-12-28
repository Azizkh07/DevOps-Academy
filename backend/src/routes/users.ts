import express from 'express';
import bcrypt from 'bcrypt';
import database from '../config/database';

const router = express.Router();

console.log('👥 FIXED Users API loaded for Medsaidabidi02 - 2025-09-09 15:12:54');

// Helpers
const generateEmailFromName = (name: string) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}.${suffix}@devopsacademy.com`;
};

const generatePassword = () => {
  return (
    Math.random().toString(36).slice(-6) +
    Math.random().toString(36).toUpperCase().slice(-2) +
    '!' +
    Math.floor(10 + Math.random() * 89)
  );
};

// Create a new user (admin)
router.post('/create', async (req, res) => {
  try {
    const { name, email, password, isAdmin = false, isApproved = false } = req.body;

    console.log('➕ POST /api/users/create - Creating user for Medsaidabidi02 at 2025-09-09 15:12:54');
    console.log('📝 User data:', { name, email: email ? 'provided' : 'will generate', isAdmin, isApproved });

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const finalEmail = email && email.trim() !== '' ? email.trim().toLowerCase() : generateEmailFromName(name);
    const finalPassword = password && password.trim() !== '' ? password : generatePassword();

    // Check duplicate
    const existing = await database.query('SELECT id FROM users WHERE email = ?', [finalEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashed = await bcrypt.hash(finalPassword, 10);

    // Insert user
    const insertResult = await database.query(`
      INSERT INTO users (name, email, password, is_admin, is_approved)
      VALUES (?, ?, ?, ?, ?)
    `, [name, finalEmail, hashed, isAdmin, isApproved]);

    // Get the created user
    const newUser = await database.query(
      'SELECT id, name, email, is_admin, is_approved, created_at, updated_at FROM users WHERE id = ?',
      [insertResult.insertId]
    );

    console.log('✅ User created successfully for Medsaidabidi02:', newUser.rows[0]);

    return res.json({
      success: true,
      message: 'User created successfully',
      user: newUser.rows[0],
      credentials: {
        email: finalEmail,
        password: finalPassword
      }
    });
  } catch (error) {
    console.error('❌ Error creating user for Medsaidabidi02:', error);
    return res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

// Get all users (admin)
router.get('/', async (req, res) => {
  try {
    console.log('📋 GET /api/users - Fetching all users for Medsaidabidi02 at 2025-09-09 15:12:54');
    
    const result = await database.query(`
      SELECT id, name, email, is_admin, is_approved, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    
    console.log(`✅ Found ${result.rows.length} users for Medsaidabidi02`);
    res.json({ success: true, users: result.rows, count: result.rows.length });
  } catch (error) {
    console.error('❌ Error fetching users for Medsaidabidi02:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
});

// Approve user
router.put('/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 PUT /api/users/${id}/approve - Approving user for Medsaidabidi02 at 2025-09-09 15:12:54`);

    // Update user approval status
    await database.query('UPDATE users SET is_approved = true WHERE id = ?', [id]);

    // Get the updated user
    const result = await database.query(
      'SELECT id, name, email, is_admin, is_approved, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User ${id} approved by Medsaidabidi02`);
    res.json({ success: true, message: 'User approved', user: result.rows[0] });
  } catch (error) {
    console.error(`❌ Error approving user ${req.params.id} for Medsaidabidi02:`, error);
    res.status(500).json({ success: false, message: 'Error approving user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, isAdmin, isApproved } = req.body;

    console.log(`🔄 PUT /api/users/${id} - Updating user for Medsaidabidi02 at 2025-09-09 15:12:54`);
    console.log('📝 Update data:', { name, email, isAdmin, isApproved });

    const fields: string[] = [];
    const values: any[] = [];

    if (name !== undefined) { fields.push('name = ?'); values.push(name); }
    if (email !== undefined) { fields.push('email = ?'); values.push(email); }
    if (isAdmin !== undefined) { fields.push('is_admin = ?'); values.push(isAdmin); }
    if (isApproved !== undefined) { fields.push('is_approved = ?'); values.push(isApproved); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    // Add updated_at field
    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id); // Add id at the end for WHERE clause

    await database.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

    // Get the updated user
    const result = await database.query(
      'SELECT id, name, email, is_admin, is_approved, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User ${id} updated by Medsaidabidi02`);
    res.json({ success: true, message: 'User updated', user: result.rows[0] });
  } catch (error) {
    console.error(`❌ Error updating user ${req.params.id} for Medsaidabidi02:`, error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ DELETE /api/users/${id} - Deleting user for Medsaidabidi02 at 2025-09-09 15:12:54`);

    // Check if user exists first
    const userCheck = await database.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userName = userCheck.rows[0].name;

    // Delete the user
    await database.query('DELETE FROM users WHERE id = ?', [id]);

    console.log(`✅ User ${id} (${userName}) deleted by Medsaidabidi02`);
    res.json({ success: true, message: 'User deleted', deletedUser: { id, name: userName } });
  } catch (error) {
    console.error(`❌ Error deleting user ${req.params.id} for Medsaidabidi02:`, error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
});

// Reset user password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log('🔑 POST /api/users/reset-password - Resetting password for Medsaidabidi02 at 2025-09-09 15:12:54');
    console.log('📧 Email:', email);

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    // Update password
    await database.query('UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?', [hashed, email]);

    // Get the updated user
    const result = await database.query(
      'SELECT id, name, email, is_admin, is_approved FROM users WHERE email = ?',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ Password reset successful for ${email} by Medsaidabidi02`);
    res.json({ 
      success: true, 
      message: 'Password reset successful', 
      user: result.rows[0], 
      newPassword 
    });
  } catch (error) {
    console.error('❌ Error resetting password for Medsaidabidi02:', error);
    res.status(500).json({ success: false, message: 'Error resetting password' });
  }
});

export { router as usersRoutes };
export default router;

console.log('👥 Users routes module loaded for Medsaidabidi02 at 2025-09-09 15:12:54');