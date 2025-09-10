const express = require('express');
const { z } = require('zod');
const { authenticateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');
const Meal = require('../models/Meal');
const User = require('../models/User');
const { generateDailyPlan, browseRecipes } = require('../services/geminiService');

const router = express.Router();

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

function startOfDay(date) {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}
function endOfDay(date) {
	const d = new Date(date);
	d.setHours(23, 59, 59, 999);
	return d;
}

function safe(arr) { return Array.isArray(arr) ? arr : []; }
// Indian fallback suggestions if Gemini fails
const fallbackIndian = {
	breakfast: [
		{ id: 'fb-idli', name: 'Idli with Sambar', meal_type: 'breakfast', calories: 350, protein_g: 12, carbs_g: 65, fat_g: 5, cooking_time: 25, cuisine: 'south indian', dietary_restrictions: ['vegetarian'] },
		{ id: 'fb-poha', name: 'Kanda Poha', meal_type: 'breakfast', calories: 300, protein_g: 8, carbs_g: 55, fat_g: 6, cooking_time: 15, cuisine: 'maharashtrian', dietary_restrictions: ['vegetarian'] },
	],
	lunch: [
		{ id: 'fb-dalroti', name: 'Dal Tadka with Roti', meal_type: 'lunch', calories: 500, protein_g: 20, carbs_g: 80, fat_g: 12, cooking_time: 30, cuisine: 'north indian', dietary_restrictions: ['vegetarian'] },
		{ id: 'fb-rajmachawal', name: 'Rajma Chawal', meal_type: 'lunch', calories: 600, protein_g: 18, carbs_g: 95, fat_g: 12, cooking_time: 40, cuisine: 'punjabi', dietary_restrictions: ['vegetarian'] },
	],
	dinner: [
		{ id: 'fb-fishcurry', name: 'Bengali Fish Curry with Rice', meal_type: 'dinner', calories: 550, protein_g: 35, carbs_g: 70, fat_g: 16, cooking_time: 35, cuisine: 'bengali', dietary_restrictions: [] },
		{ id: 'fb-khichdi', name: 'Moong Dal Khichdi with Curd', meal_type: 'dinner', calories: 480, protein_g: 16, carbs_g: 85, fat_g: 8, cooking_time: 30, cuisine: 'indian', dietary_restrictions: ['vegetarian'] },
	],
	snack: [
		{ id: 'fb-chana', name: 'Roasted Chana', meal_type: 'snack', calories: 180, protein_g: 9, carbs_g: 30, fat_g: 3, cooking_time: 5, cuisine: 'indian', dietary_restrictions: ['vegetarian', 'gluten_free'] },
		{ id: 'fb-chaat', name: 'Sprouts Chaat', meal_type: 'snack', calories: 220, protein_g: 10, carbs_g: 35, fat_g: 4, cooking_time: 10, cuisine: 'indian', dietary_restrictions: ['vegetarian'] },
	],
};

router.get('/daily-plan', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, date: z.string().optional() });
		const input = schema.parse({ user_id: req.query.user_id, date: req.query.date });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const date = input.date ? new Date(input.date) : new Date();
		const user = await User.findById(input.user_id).lean();
		if (!user) return res.status(404).json({ error: 'User not found' });
		const plan = await generateDailyPlan({ userProfile: user, dateIso: date.toISOString().slice(0,10) });
		if (!plan || !Array.isArray(plan.items)) {
			const items = [
				fallbackIndian.breakfast[0],
				fallbackIndian.lunch[0],
				fallbackIndian.dinner[0],
				fallbackIndian.snack[0],
			].filter(Boolean);
			return res.json({ meal_plan: { date: date.toISOString().slice(0,10), items } });
		}
		return res.json({ meal_plan: plan });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/recipes', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({
			user_id: objectIdString,
			cuisine: z.string().optional(),
			meal_type: z.string().optional(),
			dietary_restrictions: z.array(z.string()).optional(),
			cooking_time: z.string().optional(),
		});
		const input = schema.parse({
			user_id: req.query.user_id,
			cuisine: req.query.cuisine,
			meal_type: req.query.meal_type,
			dietary_restrictions: req.query.dietary_restrictions,
			cooking_time: req.query.cooking_time,
		});
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const user = await User.findById(input.user_id).lean();
		if (!user) return res.status(404).json({ error: 'User not found' });
		const list_of_recipes = await browseRecipes({ userProfile: user, filters: input });
		const safeList = safe(list_of_recipes);
		if (safeList.length === 0) {
			const ft = (input.meal_type || 'lunch').toLowerCase();
			const fb = fallbackIndian[ft] || [];
			return res.json({ list_of_recipes: fb });
		}
		return res.json({ list_of_recipes: safeList });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.post('/recipes/swap', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({
			user_id: objectIdString,
			meal_plan_id: z.string(),
			original_item_id: z.string(),
			new_item_id: z.string(),
		});
		const input = schema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const user = await User.findById(input.user_id).lean();
		const options = await browseRecipes({ userProfile: user, filters: {} });
		let updated_meal_plan_item = safe(options).find((r) => r.id === input.new_item_id) || null;
		if (!updated_meal_plan_item) {
			const allFb = [ ...fallbackIndian.breakfast, ...fallbackIndian.lunch, ...fallbackIndian.dinner, ...fallbackIndian.snack ];
			updated_meal_plan_item = allFb.find((r) => r.id === input.new_item_id) || null;
		}
		return res.json({ message: 'Swap successful', updated_meal_plan_item });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/grocery-list', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, start_date: z.string(), end_date: z.string() });
		const input = schema.parse({ user_id: req.query.user_id, start_date: req.query.start_date, end_date: req.query.end_date });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const start = new Date(input.start_date);
		const end = new Date(input.end_date);
		const meals = await Meal.find({ user_id: input.user_id, meal_time: { $gte: startOfDay(start), $lte: endOfDay(end) } }).lean();
		// naive grocery list from meal descriptions
		const grocery_list_items = Array.from(new Set(meals.flatMap((m) => m.food_description.toLowerCase().split(/,|\band\b|\+/).map((s) => s.trim()).filter(Boolean))));
		return res.json({ grocery_list_items });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


