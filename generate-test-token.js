// Générer un token JWT valide pour les tests
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const payload = {
  userId: 'test_user_ezia_001',
  username: 'test_user',
  email: 'test@test.com'
};

const token = jwt.sign(payload, JWT_SECRET);

console.log('Token JWT généré:');
console.log(token);
console.log('\nPour tester l\'API:');
console.log(`curl -s "http://localhost:3000/api/user-projects-db" -H "Cookie: ezia-auth-token=${token}" | jq`);