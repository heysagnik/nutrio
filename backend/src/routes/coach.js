const express = require('express');
const { z } = require('zod');
const { authenticateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');

const router = express.Router();

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

const { coachChat } = require('../services/geminiService');

router.post('/chat', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, message_text: z.string().min(1) });
		const input = schema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const userContext = {}; // TODO: enrich with actual profile if needed
		const response_text = await coachChat({ userContext, messageText: input.message_text });
		return res.json({ response_text });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/educational-content', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, category: z.string().optional() });
		const input = schema.parse({ user_id: req.query.user_id, category: req.query.category });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const allContent = [
			{ id: 'c1', title: 'Hydration Basics', category: 'hydration' },
			{ id: 'c2', title: 'Protein 101', category: 'macros' },
			{ id: 'c3', title: 'Meal Prep Tips', category: 'meal_prep' },
		];
		const list_of_content_items = input.category ? allContent.filter(c => c.category === input.category) : allContent;
		return res.json({ list_of_content_items });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


