const express = require('express');
const router = express.Router();

const userService = require('../services/userService');
const { authenticateToken, generateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');
const { z } = require('zod');

// Helpers
function pickUserProfile(user) {
	return {
		id: user.id,
		email: user.email,
		profile: user.profile || {},
		goals: user.goals || {},
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
	name: z.string().min(1),
	age: z.number().int().positive(),
	gender: z.string().min(1),
	height: z.number().positive(),
	weight: z.number().positive(),
	location: z.string().min(1),
	activity_level: z.string().min(1),
	occupation: z.string().min(1),
	sleep_duration: z.number().nonnegative(),
	stress_level: z.string().min(1),
	medical_conditions: z.array(z.string()),
	allergies: z.array(z.string()),
	dietary_restrictions: z.array(z.string()),
	medications: z.array(z.string()).optional(),
	health_goal: z.string().min(1),
	target_weight: z.number().positive(),
	preferred_cuisines: z.array(z.string()),
	cooking_skill: z.string().min(1),
	dietary_dislikes: z.array(z.string()),
	consent_given: z.boolean(),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

// POST /api/users/register
router.post('/register', async (req, res, next) => {
	try {
		await connectToDatabase();
		const parsed = registerSchema.parse(req.body || {});
		const { userId } = await userService.createUser({
			email: parsed.email,
			password: parsed.password,
			profile: {
				name: parsed.name,
				age: parsed.age,
				gender: parsed.gender,
				height: parsed.height,
				weight: parsed.weight,
				location: parsed.location,
				activity_level: parsed.activity_level,
				occupation: parsed.occupation,
				sleep_duration: parsed.sleep_duration,
				stress_level: parsed.stress_level,
				medical_conditions: parsed.medical_conditions,
				allergies: parsed.allergies,
				dietary_restrictions: parsed.dietary_restrictions,
				medications: parsed.medications,
				preferred_cuisines: parsed.preferred_cuisines,
				cooking_skill: parsed.cooking_skill,
				dietary_dislikes: parsed.dietary_dislikes,
				consent_given: parsed.consent_given,
			},
			goals: {
				health_goal: parsed.health_goal,
				target_weight: parsed.target_weight,
			},
		});

		return res.status(201).json({ user_id: userId, message: 'User registered successfully' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
	try {
		await connectToDatabase();
		const { email, password } = loginSchema.parse(req.body || {});
		const user = await userService.validateCredentials(email, password);
		if (!user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}
		const token = generateToken({ id: user.id, email: user.email });
		return res.json({ token, user_id: user.id, message: 'Login successful' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

// GET /api/users/:user_id/profile
router.get('/:user_id/profile', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const { user_id } = z.object({ user_id: objectIdString }).parse(req.params);
		if (req.user?.id !== user_id) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		const user = await userService.getUserById(user_id);
		if (!user) return res.status(404).json({ error: 'User not found' });
		return res.json({ user_profile_data: pickUserProfile(user) });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

// PUT /api/users/:user_id/profile
router.put('/:user_id/profile', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const { user_id } = z.object({ user_id: objectIdString }).parse(req.params);
		if (req.user?.id !== user_id) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		await userService.updateProfile(user_id, req.body || {});
		return res.json({ message: 'Profile updated successfully' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

// PUT /api/users/:user_id/goals
router.put('/:user_id/goals', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const { user_id } = z.object({ user_id: objectIdString }).parse(req.params);
		if (req.user?.id !== user_id) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		await userService.updateGoals(user_id, req.body || {});
		return res.json({ message: 'Goals updated successfully' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


