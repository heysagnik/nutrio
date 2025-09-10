const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		age: { type: Number, required: true },
		gender: { type: String, required: true },
		height: { type: Number, required: true },
		weight: { type: Number, required: true },
		location: { type: String, required: true },
		activity_level: { type: String, required: true },
		occupation: { type: String, required: true },
		sleep_duration: { type: Number, required: true },
		stress_level: { type: String, required: true },
		medical_conditions: { type: [String], required: true, default: [] },
		allergies: { type: [String], required: true, default: [] },
		dietary_restrictions: { type: [String], required: true, default: [] },
		medications: { type: [String], default: [] },
		preferred_cuisines: { type: [String], required: true, default: [] },
		cooking_skill: { type: String, required: true },
		dietary_dislikes: { type: [String], required: true, default: [] },
		consent_given: { type: Boolean, required: true },
	},
	{ _id: false }
);

const GoalsSchema = new mongoose.Schema(
	{
		health_goal: { type: String, required: true },
		target_weight: { type: Number, required: true },
	},
	{ _id: false }
);

const UserSchema = new mongoose.Schema(
	{
		email: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		profile: { type: ProfileSchema, required: true },
		goals: { type: GoalsSchema, required: true },
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);


