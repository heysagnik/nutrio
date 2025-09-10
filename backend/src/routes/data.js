const express = require('express');
const { z } = require('zod');
const { authenticateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');
const Meal = require('../models/Meal');
const Activity = require('../models/Activity');
const WeightLog = require('../models/WeightLog');
const WearableSync = require('../models/WearableSync');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const { analyzeMealFromImage } = require('../services/geminiService');

const router = express.Router();

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

const mealSchema = z.object({
	user_id: objectIdString,
	meal_type: z.string().min(1),
	food_description: z.string().optional(),
	portion_size: z.string().optional(),
	cooking_method: z.string().optional(),
	meal_time: z.coerce.date(),
});

const activitySchema = z.object({
	user_id: objectIdString,
	activity_type: z.string().min(1),
	duration_minutes: z.number().int().positive(),
	intensity: z.string().optional(),
	activity_date: z.coerce.date(),
});

const weightSchema = z.object({
	user_id: objectIdString,
	weight_kg: z.number().positive(),
	log_date: z.coerce.date(),
});

const wearableSchema = z.object({
	user_id: objectIdString,
	device_data: z.record(z.any()),
});

// Placeholder: parse nutrition from food description (stub for Gemini/DB lookup)
async function parseNutritionFromDescription(description) {
	const calories = Math.max(50, Math.min(900, Math.round(description.length * 7)));
	return {
		calories,
		protein_g: Math.round(calories * 0.15 / 4),
		carbs_g: Math.round(calories * 0.55 / 4),
		fat_g: Math.round(calories * 0.30 / 9),
		fiber_g: 5,
		sodium_mg: 500,
		sugars_g: 10,
	};
}

// Supports either JSON body or multipart/form-data with image file field "image"
router.post('/meals', authenticateToken, upload.single('image'), async (req, res, next) => {
	try {
		await connectToDatabase();
		const parseTarget = req.is('multipart/form-data') ? req.body : req.body;
		const input = mealSchema.parse(parseTarget);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		let parsed_nutritional_data;
		if (req.file && req.file.buffer) {
			const b64 = req.file.buffer.toString('base64');
			parsed_nutritional_data = await analyzeMealFromImage({ imageBase64: b64, metadata: { meal_type: input.meal_type, portion_size: input.portion_size, cooking_method: input.cooking_method } });
		} else if (input.food_description) {
			parsed_nutritional_data = await parseNutritionFromDescription(input.food_description);
		} else {
			return res.status(400).json({ error: 'Provide either image or food_description' });
		}
		const meal = await Meal.create({ ...input, parsed_nutritional_data });
		return res.status(201).json({ meal_id: String(meal._id), message: 'Meal logged successfully', parsed_nutritional_data });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.post('/activities', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const input = activitySchema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const activity = await Activity.create(input);
		return res.status(201).json({ activity_id: String(activity._id), message: 'Activity logged successfully' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.post('/weight', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const input = weightSchema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const weight = await WeightLog.create(input);
		return res.status(201).json({ weight_log_id: String(weight._id), message: 'Weight logged successfully' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.post('/wearables/sync', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const input = wearableSchema.parse(req.body);
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		await WearableSync.create(input);
		return res.status(200).json({ message: 'Wearable data received' });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


