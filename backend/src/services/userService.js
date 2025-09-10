const { hashPassword, comparePassword } = require('../utils/auth');
const User = require('../models/User');

async function createUser({ email, password, profile = {}, goals = {} }) {
	const existing = await User.findOne({ email: String(email).toLowerCase() }).lean();
	if (existing) {
		const err = new Error('Email already in use');
		err.statusCode = 409;
		throw err;
	}
	const user = await User.create({
		email: String(email).toLowerCase(),
		passwordHash: await hashPassword(password),
		profile,
		goals,
	});
	return { userId: String(user._id) };
}

async function validateCredentials(email, password) {
	const user = await User.findOne({ email: String(email).toLowerCase() });
	if (!user) return null;
	const ok = await comparePassword(password, user.passwordHash);
	if (!ok) return null;
	return { id: String(user._id), email: user.email };
}

async function getUserById(userId) {
	const user = await User.findById(userId).lean();
	if (!user) return null;
	return {
		id: String(user._id),
		email: user.email,
		profile: user.profile,
		goals: user.goals,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

async function updateProfile(userId, updatedProfile) {
	const user = await User.findById(userId);
	if (!user) {
		const err = new Error('User not found');
		err.statusCode = 404;
		throw err;
	}
	user.profile = { ...user.profile?.toObject?.() ?? user.profile, ...updatedProfile };
	await user.save();
}

async function updateGoals(userId, newGoals) {
	const user = await User.findById(userId);
	if (!user) {
		const err = new Error('User not found');
		err.statusCode = 404;
		throw err;
	}
	user.goals = { ...user.goals?.toObject?.() ?? user.goals, ...newGoals };
	await user.save();
}

module.exports = {
	createUser,
	validateCredentials,
	getUserById,
	updateProfile,
	updateGoals,
};


