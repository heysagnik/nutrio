const express = require('express');
const { z } = require('zod');
const { connectToDatabase } = require('../db/connection');
const FoodItem = require('../models/FoodItem');

const router = express.Router();

router.get('/food-item/:food_id', async (req, res, next) => {
	try {
		await connectToDatabase();
		const { food_id } = z.object({ food_id: z.string().min(1) }).parse(req.params);
		const item = await FoodItem.findOne({ food_id }).lean();
		if (!item) return res.status(404).json({ error: 'Food item not found' });
		return res.json({ nutritional_data: item.nutritional_data, name: item.name, cuisine: item.cuisine, meal_type: item.meal_type });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/search', async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ query_text: z.string().min(1), limit: z.coerce.number().int().positive().max(50).optional() });
		const input = schema.parse({ query_text: req.query.query_text, limit: req.query.limit });
		const q = input.query_text;
		const limit = input.limit || 10;
		const items = await FoodItem.find({ name: { $regex: q, $options: 'i' } }).limit(limit).lean();
		const list_of_food_items = items.map(i => ({ food_id: i.food_id, name: i.name, nutritional_data: i.nutritional_data }));
		return res.json({ list_of_food_items });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


