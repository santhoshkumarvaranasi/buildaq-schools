let bcrypt;
try {
	bcrypt = require('bcryptjs');
} catch (e) {
	// Fallback to backend-installed bcryptjs if available
	bcrypt = require('../backend/node_modules/bcryptjs');
}

const pwd = process.argv[2] || process.env.PASSWORD || 'BuildAQDemo!2025';
const saltRounds = 10;
const hash = bcrypt.hashSync(pwd, saltRounds);
console.log(hash);
