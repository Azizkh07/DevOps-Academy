const mysql = require('mysql2/promise');

async function updateEmails() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3307,
      user: 'legal_app_user',
      password: 'ROOT',
      database: 'legal_education_mysql5'
    });

    console.log('✅ Connected to database');

    // Update admin email
    await connection.execute(
      "UPDATE users SET email = 'admin@devopsacademy.com' WHERE email = 'admin@cliniquejuriste.com'"
    );
    console.log('✅ Updated admin email');

    // Update sami email
    await connection.execute(
      "UPDATE users SET email = 'sami@devopsacademy.com' WHERE email = 'sami@cliniquejuriste.com'"
    );
    console.log('✅ Updated sami email');

    // Update rami email
    await connection.execute(
      "UPDATE users SET email = 'rami@devopsacademy.com' WHERE email = 'rami@cliniquejuriste.com'"
    );
    console.log('✅ Updated rami email');

    // Show all users
    const [users] = await connection.query('SELECT id, name, email, is_admin FROM users');
    console.log('\n📋 Current users in database:');
    console.table(users);

    await connection.end();
    console.log('\n✅ All email updates completed!');
    console.log('🔐 You can now login with: admin@devopsacademy.com');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updateEmails();
