const mongoose = require('mongoose');

const RecommendationRatingSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		recommendation_id: { type: String, required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('RecommendationRating', RecommendationRatingSchema);


