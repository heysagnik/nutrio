const express = require('express');
const { z } = require('zod');
const { authenticateToken } = require('../utils/auth');
const { connectToDatabase } = require('../db/connection');
const WeightLog = require('../models/WeightLog');
const Meal = require('../models/Meal');
const Activity = require('../models/Activity');
const User = require('../models/User');

const router = express.Router();

const objectIdString = z.string().regex(/^[a-fA-F0-9]{24}$/);

function startOfDay(date) { const d = new Date(date); d.setHours(0,0,0,0); return d; }
function endOfDay(date) { const d = new Date(date); d.setHours(23,59,59,999); return d; }

function getRange(startDate, endDate) {
	const start = startDate ? new Date(startDate) : new Date('1970-01-01');
	const end = endDate ? new Date(endDate) : new Date();
	return { start: startOfDay(start), end: endOfDay(end) };
}

router.get('/weight-history', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, start_date: z.string().optional(), end_date: z.string().optional() });
		const input = schema.parse({ user_id: req.query.user_id, start_date: req.query.start_date, end_date: req.query.end_date });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const { start, end } = getRange(input.start_date, input.end_date);
		const logs = await WeightLog.find({ user_id: input.user_id, log_date: { $gte: start, $lte: end } }).sort({ log_date: 1 }).lean();
		return res.json({ array_of_weight_logs: logs.map(l => ({ id: String(l._id), weight_kg: l.weight_kg, log_date: l.log_date })) });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/nutrient-summary', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, time_frame: z.enum(['daily','weekly','monthly']), start_date: z.string().optional(), end_date: z.string().optional() });
		const input = schema.parse({ user_id: req.query.user_id, time_frame: req.query.time_frame, start_date: req.query.start_date, end_date: req.query.end_date });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const { start, end } = getRange(input.start_date, input.end_date);
		const meals = await Meal.find({ user_id: input.user_id, meal_time: { $gte: start, $lte: end } }).lean();
		// Aggregate by timeframe key
		const buckets = {};
		for (const m of meals) {
			const d = new Date(m.meal_time);
			let key;
			if (input.time_frame === 'daily') key = d.toISOString().slice(0,10);
			else if (input.time_frame === 'weekly') { const first = new Date(d); const day = (first.getDay()+6)%7; first.setDate(first.getDate()-day); key = first.toISOString().slice(0,10); }
			else { key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; }
			const n = m.parsed_nutritional_data || {};
			if (!buckets[key]) buckets[key] = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, sodium_mg: 0, sugars_g: 0 };
			buckets[key].calories += n.calories || 0;
			buckets[key].protein_g += n.protein_g || 0;
			buckets[key].carbs_g += n.carbs_g || 0;
			buckets[key].fat_g += n.fat_g || 0;
			buckets[key].fiber_g += n.fiber_g || 0;
			buckets[key].sodium_mg += n.sodium_mg || 0;
			buckets[key].sugars_g += n.sugars_g || 0;
		}
		const nutrient_summary_data = Object.entries(buckets).sort((a,b)=>a[0].localeCompare(b[0])).map(([period, totals])=>({ period, ...totals }));
		return res.json({ nutrient_summary_data });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/activity-summary', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString, time_frame: z.enum(['daily','weekly','monthly']), start_date: z.string().optional(), end_date: z.string().optional() });
		const input = schema.parse({ user_id: req.query.user_id, time_frame: req.query.time_frame, start_date: req.query.start_date, end_date: req.query.end_date });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const { start, end } = getRange(input.start_date, input.end_date);
		const acts = await Activity.find({ user_id: input.user_id, activity_date: { $gte: start, $lte: end } }).lean();
		const buckets = {};
		for (const a of acts) {
			const d = new Date(a.activity_date);
			let key;
			if (input.time_frame === 'daily') key = d.toISOString().slice(0,10);
			else if (input.time_frame === 'weekly') { const first = new Date(d); const day = (first.getDay()+6)%7; first.setDate(first.getDate()-day); key = first.toISOString().slice(0,10); }
			else { key = `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}`; }
			if (!buckets[key]) buckets[key] = { total_minutes: 0, activities: {} };
			buckets[key].total_minutes += a.duration_minutes || 0;
			buckets[key].activities[a.activity_type] = (buckets[key].activities[a.activity_type] || 0) + (a.duration_minutes || 0);
		}
		const activity_summary_data = Object.entries(buckets).sort((a,b)=>a[0].localeCompare(b[0])).map(([period, data])=>({ period, ...data }));
		return res.json({ activity_summary_data });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

router.get('/goals-status', authenticateToken, async (req, res, next) => {
	try {
		await connectToDatabase();
		const schema = z.object({ user_id: objectIdString });
		const input = schema.parse({ user_id: req.query.user_id });
		if (req.user?.id !== input.user_id) return res.status(403).json({ error: 'Forbidden' });
		const user = await User.findById(input.user_id).lean();
		if (!user) return res.status(404).json({ error: 'User not found' });
		const latestWeight = await WeightLog.findOne({ user_id: input.user_id }).sort({ log_date: -1 }).lean();
		const current_weight = latestWeight?.weight_kg ?? user.profile?.weight ?? null;
		const target_weight = user.goals?.target_weight ?? null;
		let progress_percentage = null;
		if (current_weight != null && target_weight != null && user.profile?.weight != null) {
			const startWeight = user.profile.weight;
			const totalChange = Math.abs(startWeight - target_weight);
			const done = Math.abs(startWeight - current_weight);
			progress_percentage = totalChange > 0 ? Math.min(100, Math.round((done / totalChange) * 100)) : 0;
		}
		return res.json({ goal_status_data: { current_weight, target_weight, progress_percentage } });
	} catch (err) {
		if (err?.issues) return res.status(400).json({ error: 'Invalid input', details: err.issues });
		next(err);
	}
});

module.exports = router;


