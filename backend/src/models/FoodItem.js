const mongoose = require('mongoose');

const NutritionalDataSchema = new mongoose.Schema(
	{
		calories: { type: Number },
		protein_g: { type: Number },
		carbs_g: { type: Number },
		fat_g: { type: Number },
		fiber_g: { type: Number },
		sodium_mg: { type: Number },
		sugars_g: { type: Number },
		micros: { type: Object },
	},
	{ _id: false }
);

const FoodItemSchema = new mongoose.Schema(
	{
		food_id: { type: String, required: true, unique: true, index: true },
		name: { type: String, required: true, index: true },
		cuisine: { type: String },
		meal_type: { type: String },
		dietary_restrictions: { type: [String], default: [] },
		nutritional_data: { type: NutritionalDataSchema },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('FoodItem', FoodItemSchema);


