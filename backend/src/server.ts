import app from './app';
import { config } from './config';
import database from './config/database';

const startServer = async () => {
  try {
    // Test database connection using the helper function
    console.log('🔌 Attempting database connection...');
    const testResult = await database.query('SELECT NOW() as now');
    console.log(`✅ Database connection successful: ${JSON.stringify(testResult.rows)}`);
    console.log('✅ Database connected successfully');

    // Check if admin exists (wrapped in try-catch for new databases)
    try {
      const adminCheck = await database.query(
        'SELECT email, is_admin, is_approved FROM users WHERE is_admin = true'
      );
      
      console.log('👑 Admin users found:', adminCheck.rows.length);
      if (adminCheck.rows.length > 0) {
        console.log('👑 Admin details:', adminCheck.rows.map((u: any) => ({
          email: u.email,
          is_admin: u.is_admin,
          is_approved: u.is_approved
        })));
      }
    } catch (dbError: any) {
      console.log('⚠️  Database tables not initialized yet:', dbError.message);
      console.log('💡 Please run database migrations to initialize schema');
    }
    
    // Only start server if this file is run directly (not through Passenger)
    if (require.main === module) {
      app.listen(config.port, () => {
        console.log(`🚀 Server running on port ${config.port}`);
        console.log(`🌍 Environment: ${config.nodeEnv}`);
        console.log(`📡 API URL: ${config.apiUrl}`);
        console.log(`📁 Uploads path: ${config.storage.uploadsPath}`);
      });
    }
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    if (require.main === module) {
      process.exit(1);
    }
    throw error; // Re-throw for Passenger
  }
};

// Initialize the server
startServer();

