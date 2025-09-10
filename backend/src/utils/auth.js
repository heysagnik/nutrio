const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function hashPassword(plain) {
	const salt = await bcrypt.genSalt(10);
	return bcrypt.hash(plain, salt);
}

async function comparePassword(plain, hash) {
	return bcrypt.compare(plain, hash);
}

function generateToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authenticateToken(req, res, next) {
	const authHeader = req.headers['authorization'] || '';
	const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Missing token' });
	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		return next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
}

module.exports = {
	hashPassword,
	comparePassword,
	generateToken,
	authenticateToken,
};


