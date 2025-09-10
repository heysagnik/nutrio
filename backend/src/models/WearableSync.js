const mongoose = require('mongoose');

const WearableSyncSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		device_data: { type: mongoose.Schema.Types.Mixed, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('WearableSync', WearableSyncSchema);


