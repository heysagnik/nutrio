const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		activity_type: { type: String, required: true },
		duration_minutes: { type: Number, required: true },
		intensity: { type: String },
		activity_date: { type: Date, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Activity', ActivitySchema);


