const mongoose = require('mongoose');

const ParsedNutritionSchema = new mongoose.Schema(
	{
		calories: Number,
		protein_g: Number,
		carbs_g: Number,
		fat_g: Number,
		fiber_g: Number,
		sodium_mg: Number,
		sugars_g: Number,
	},
	{ _id: false }
);

const MealSchema = new mongoose.Schema(
	{
		user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		meal_type: { type: String, required: true },
		food_description: { type: String },
		portion_size: { type: String },
		cooking_method: { type: String },
		meal_time: { type: Date, required: true },
		parsed_nutritional_data: { type: ParsedNutritionSchema },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Meal', MealSchema);


