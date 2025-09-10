const mongoose = require('mongoose');

const WeightLogSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		weight_kg: { type: Number, required: true },
		log_date: { type: Date, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('WeightLog', WeightLogSchema);


