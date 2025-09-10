const express = require('express');
const { z } = require('zod');
const { authenticateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');
const RecommendationRating = require('../models/RecommendationRating');
const Adherence = require('../models/Adherence');

const router = express.Router();

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

router.post('/recommendation-rating', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, recommendation_id: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().optional() });
		const input = schema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		await RecommendationRating.create(input);
		return res.status(201).json({ message: 'Rating submitted' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.post('/adherence', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, plan_id: z.string(), adherence_status: z.enum(['followed','skipped','substituted']) });
		const input = schema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		await Adherence.create(input);
		return res.status(201).json({ message: 'Adherence logged' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


