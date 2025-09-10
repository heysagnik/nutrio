const mongoose = require('mongoose');

const AdherenceSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		plan_id: { type: String, required: true },
		adherence_status: { type: String, enum: ['followed', 'skipped', 'substituted'], required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Adherence', AdherenceSchema);


