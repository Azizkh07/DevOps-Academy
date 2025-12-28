const mysql = require('mysql2/promise');

async function setupDatabase() {
  console.log('🚀 Setting up MySQL 5 database on port 3307 for Legal Education Platform...');
  
  let connection = null;
  
  try {
    // First connection to create database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'ROOT',
      port: 3307
    });
    
    console.log('✅ Connected to MySQL server successfully!');

    // Create database using query() instead of execute()
    await connection.query('DROP DATABASE IF EXISTS legal_education_mysql5');
    await connection.query('CREATE DATABASE legal_education_mysql5');
    console.log('📦 Created database: legal_education_mysql5');

    // Create user using query()
    try {
      await connection.query("DROP USER IF EXISTS 'legal_app_user'@'localhost'");
    } catch (e) { /* User might not exist */ }
    
    await connection.query("CREATE USER 'legal_app_user'@'localhost' IDENTIFIED BY 'ROOT'");
    await connection.query("GRANT ALL PRIVILEGES ON legal_education_mysql5.* TO 'legal_app_user'@'localhost'");
    await connection.query('FLUSH PRIVILEGES');
    console.log('👤 Created user: legal_app_user');

    // Close first connection
    await connection.end();

    // Create new connection directly to the database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'ROOT',
      port: 3307,
      database: 'legal_education_mysql5'
    });

    console.log('🔗 Connected to legal_education_mysql5 database');

    // Create tables using query() method
    console.log('🏗️ Creating tables...');

    // Users table
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_approved BOOLEAN DEFAULT FALSE,
        is_admin BOOLEAN DEFAULT FALSE,
        last_ip VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created users table');

    // Courses table
    await connection.query(`
      CREATE TABLE courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        cover_image VARCHAR(500),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        category VARCHAR(100),
        thumbnail_path VARCHAR(500)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created courses table');

    // Subjects table
    await connection.query(`
      CREATE TABLE subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        professor_name VARCHAR(255) NOT NULL,
        hours INT DEFAULT 0 NOT NULL,
        order_index INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created subjects table');

    // Videos table
    await connection.query(`
      CREATE TABLE videos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        course_id INT,
        file_path VARCHAR(500) NOT NULL,
        file_size BIGINT,
        duration INT,
        mime_type VARCHAR(100),
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        description TEXT,
        thumbnail_url VARCHAR(255),
        preview_url VARCHAR(255),
        views_count INT DEFAULT 0,
        likes_count INT DEFAULT 0,
        thumbnail_path VARCHAR(255),
        subject_id INT,
        order_index INT DEFAULT 0,
        video_path VARCHAR(500) NOT NULL,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created videos table');

    // User courses table
    await connection.query(`
      CREATE TABLE user_courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY user_courses_user_id_course_id_key (user_id, course_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created user_courses table');

    // User sessions table (MySQL 5 compatible - using DATETIME for expires_at)
    await connection.query(`
      CREATE TABLE user_sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        session_token VARCHAR(255) NOT NULL UNIQUE,
        jwt_token TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        tab_id VARCHAR(255),
        browser_info TEXT,
        client_ip VARCHAR(45),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created user_sessions table');

    // Video likes table
    await connection.query(`
      CREATE TABLE video_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY video_likes_video_id_user_id_key (video_id, user_id),
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created video_likes table');

    // Video progress table
    await connection.query(`
      CREATE TABLE video_progress (
        id INT AUTO_INCREMENT PRIMARY KEY,
        video_id INT NOT NULL,
        user_id INT NOT NULL,
        position_seconds DOUBLE DEFAULT 0 NOT NULL,
        watched_percentage INT DEFAULT 0 NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY video_progress_video_id_user_id_key (video_id, user_id),
        FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created video_progress table');

    // Sessions table (MySQL 5 compatible - using DATETIME for expires_at)
    await connection.query(`
      CREATE TABLE sessions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created sessions table');

    // Blog posts table
    await connection.query(`
      CREATE TABLE blog_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        cover_image VARCHAR(500),
        published BOOLEAN DEFAULT FALSE,
        author_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✅ Created blog_posts table');

    console.log('✅ All tables created successfully!');

    // Insert data using execute() for parameterized queries
    console.log('📊 Inserting data...');

    // Insert users
    const users = [
      [1, 'Administrateur', 'admin@devopsacademy.com', '$2b$10$uKCfx3P642zXx7DKwbajk.qgfQc.0h1i537XbMGBD14QNZ84.Ho.m', true, true, null, '2025-08-15 17:28:49', '2025-08-16 20:33:01'],
      [8, 'salem', 'salem@gmail.com', '$2b$10$oyRzKFn0FiskzkIwHOM9.OrtzXcyJgCYefnkxPQjXUWKCJVKfx1UO', true, false, null, '2025-08-21 17:33:52', '2025-08-25 02:08:51'],
      [13, 'Ahmed', 'ahmed@gmail.com', '$2b$10$jX51kUHbq2dvEawW1gywv..yla1.yzDJ.yXdj9o0IdmKUo81S.D7q', true, false, null, '2025-08-25 21:20:40', '2025-08-25 21:21:20'],
      [14, 'SAMItrt', 'sami@devopsacademy.com', '$2b$10$1iYXOSoTuBmdG7NLN7BlCeGnTe2ix9kRd2dKGZA3vba/eJRtK5XfS', true, false, null, '2025-08-31 12:54:10', '2025-08-31 18:33:28'],
      [15, 'rami', 'rami@devopsacademy.com', '$2b$10$wFL/VmhTDD6WKVrlF.V8R.tVkbUqQaTUmZvxaRPR9DsTGVffJXqfS', true, false, null, '2025-09-06 20:32:19', '2025-09-06 21:39:48']
    ];

    for (const user of users) {
      await connection.execute(
        'INSERT INTO users (id, name, email, password, is_approved, is_admin, last_ip, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        user
      );
    }
    console.log('👥 Inserted users');

    // Insert courses
    const courses = [
      [47, 'kukuk', 'ukkhu', null, true, '2025-08-31 14:14:47', '2025-08-31 14:14:47', null, null],
      [48, 'ggtgt', 'gtgtgtggr', null, true, '2025-09-04 18:25:24', '2025-09-04 18:25:24', null, null],
      [49, 'hhhhhhhh', 'hhhhhhhhhhhhhh', null, true, '2025-09-06 21:40:53', '2025-09-06 21:40:53', null, null]
    ];

    for (const course of courses) {
      await connection.execute(
        'INSERT INTO courses (id, title, description, cover_image, is_active, created_at, updated_at, category, thumbnail_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        course
      );
    }
    console.log('📚 Inserted courses');

    // Insert subjects
    const subjects = [
      [38, 47, 'sgfd', 'fgsd', 'gfsd', 23, 1, true, '2025-08-31 14:14:54', '2025-08-31 14:14:54'],
      [39, 48, 'rgrgrg', 'rtgrtg', 'gtrg', 3, 1, true, '2025-09-04 18:25:32', '2025-09-04 18:25:32'],
      [40, 49, 'hhhhhhhhhhh', 'hgfhgfh', 'hfghgf', 12, 1, true, '2025-09-06 21:41:00', '2025-09-06 21:41:00']
    ];

    for (const subject of subjects) {
      await connection.execute(
        'INSERT INTO subjects (id, course_id, title, description, professor_name, hours, order_index, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        subject
      );
    }
    console.log('📖 Inserted subjects');

    // Insert user_courses
    await connection.execute(
      'INSERT INTO user_courses (id, user_id, course_id, assigned_at, expires_at, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [23, 15, 48, '2025-09-06 21:39:24', null, true, '2025-09-06 21:39:24']
    );
    console.log('🔗 Inserted user courses');

    // Insert videos
    const videos = [
      [45, 'fdgfgd', null, 'video-1756642521417-735582084.mp4', 12096722, 0, 'video/mp4', true, '2025-08-31 14:15:21', '2025-08-31 14:15:21', 'fgdfdfg', null, null, 0, 0, 'thumbnail-1756642521503-207468283.jpg', 38, 1, 'video-1756642521417-735582084.mp4'],
      [46, 'gtrgr', null, 'video-1757003174860-712706225.mp4', 15381421, 0, 'video/mp4', true, '2025-09-04 18:26:15', '2025-09-04 18:26:15', 'egr', null, null, 0, 0, 'thumbnail-1757003174953-138205274.jpg', 39, 1, 'video-1757003174860-712706225.mp4'],
      [47, 'efe', null, 'video-1757183512189-561211962.mp4', 12096722, 0, 'video/mp4', true, '2025-09-06 20:31:52', '2025-09-06 20:31:52', 'fef', null, null, 0, 0, 'thumbnail-1757183512320-74993152.jpg', 38, 2, 'video-1757183512189-561211962.mp4'],
      [48, 'htghgh', null, 'video-1757187676547-903366332.mp4', 18077770, 0, 'video/mp4', true, '2025-09-06 21:41:16', '2025-09-06 21:41:16', 'thrthrt', null, null, 0, 0, 'thumbnail-1757187676671-322796111.jpg', 40, 1, 'video-1757187676547-903366332.mp4']
    ];

    for (const video of videos) {
      await connection.execute(
        'INSERT INTO videos (id, title, course_id, file_path, file_size, duration, mime_type, is_active, created_at, updated_at, description, thumbnail_url, preview_url, views_count, likes_count, thumbnail_path, subject_id, order_index, video_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        video
      );
    }
    console.log('🎥 Inserted videos');

    // Set auto increment values using query()
    await connection.query('ALTER TABLE users AUTO_INCREMENT = 16');
    await connection.query('ALTER TABLE courses AUTO_INCREMENT = 50');
    await connection.query('ALTER TABLE subjects AUTO_INCREMENT = 41');
    await connection.query('ALTER TABLE user_courses AUTO_INCREMENT = 24');
    await connection.query('ALTER TABLE videos AUTO_INCREMENT = 49');
    console.log('🔢 Set auto increment values');

    // Create statistics view using query()
    await connection.query(`
      CREATE VIEW course_statistics AS
      SELECT 
        c.id AS course_id,
        c.title AS course_title,
        COUNT(DISTINCT s.id) AS total_subjects,
        COUNT(DISTINCT v.id) AS total_videos,
        COALESCE(SUM(s.hours), 0) AS total_hours,
        COUNT(DISTINCT s.professor_name) AS total_professors,
        COALESCE(SUM(v.file_size), 0) AS total_video_size
      FROM courses c
      LEFT JOIN subjects s ON (c.id = s.course_id AND s.is_active = TRUE)
      LEFT JOIN videos v ON (s.id = v.subject_id AND v.is_active = TRUE)
      WHERE c.is_active = TRUE
      GROUP BY c.id, c.title
    `);
    console.log('📊 Created statistics view');

    // Verify data
    const [users_count] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [courses_count] = await connection.execute('SELECT COUNT(*) as count FROM courses');
    const [videos_count] = await connection.execute('SELECT COUNT(*) as count FROM videos');

    console.log('\n🎉 MySQL 5 database setup completed successfully on port 3307!');
    console.log(`👥 Users: ${users_count[0].count}`);
    console.log(`📚 Courses: ${courses_count[0].count}`);
    console.log(`🎥 Videos: ${videos_count[0].count}`);
    console.log('\n📝 Your .env file should have:');
    console.log('DATABASE_URL=mysql://legal_app_user:ROOT@localhost:3307/legal_education_mysql5');
    console.log('\n✅ Ready to start your MySQL5 application!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.error('📋 Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();