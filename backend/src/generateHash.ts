import * as bcrypt from 'bcrypt';

const generateHash = async () => {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    console.log('🔑 Password:', password);
    console.log('🔑 Generated Hash:', hash);
    console.log('🔑 Hash Length:', hash.length);
    
    // Test it immediately
    const test = await bcrypt.compare(password, hash);
    console.log('🧪 Verification Test:', test);
    
    console.log('\n📋 SQL COMMAND TO RUN:');
    console.log(`UPDATE users SET password = '${hash}' WHERE email = 'admin@devopsacademy.com';`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

generateHash();