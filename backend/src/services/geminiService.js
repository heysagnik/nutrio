const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;
let client;

function stripCodeFences(text) {
	if (!text) return '';
	return String(text).replace(/^```[\s\S]*?\n?|```$/g, '').replace(/^```json\n|```$/g, '');
}

function extractFirstJsonObject(text) {
	const stripped = stripCodeFences(text).trim();
	// Fast path
	try { return JSON.parse(stripped); } catch (_) {}
	// Try to find first {...} block
	let depth = 0;
	let start = -1;
	for (let i = 0; i < stripped.length; i++) {
		const ch = stripped[i];
		if (ch === '{') { if (depth === 0) start = i; depth++; }
		else if (ch === '}') { depth--; if (depth === 0 && start !== -1) {
			const candidate = stripped.slice(start, i + 1);
			try { return JSON.parse(candidate); } catch (_) { /* continue */ }
		}}
	}
	return null;
}

function getRegionFromProfile(userProfile) {
	const location = userProfile?.profile?.location || '';
	const lower = String(location).toLowerCase();
	if (/bengal|kolkata|west bengal/.test(lower)) return 'bengali';
	if (/gujarat|ahmedabad|surat|vadodara|rajkot/.test(lower)) return 'gujarati';
	if (/punjab|chandigarh|ludhiana|amritsar/.test(lower)) return 'punjabi';
	if (/tamil|chennai|tamil nadu/.test(lower)) return 'tamil';
	if (/kerala|kochi|thiruvananthapuram/.test(lower)) return 'kerala';
	if (/maharashtra|mumbai|pune/.test(lower)) return 'maharashtrian';
	if (/andhra|telangana|hyderabad/.test(lower)) return 'telugu';
	if (/karnataka|bengaluru|bangalore/.test(lower)) return 'kannadiga';
	return 'indian';
}

function getClient() {
	if (!API_KEY) {
		throw new Error('GEMINI_API_KEY is not set');
	}
	if (!client) client = new GoogleGenerativeAI(API_KEY);
	return client;
}

async function analyzeMealFromImage({ imageBase64, metadata }) {
	const genAI = getClient();
	const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
	const prompt = `You are analyzing Indian meals. Consider regional variations (e.g., Bengali, Gujarati, Punjabi, South Indian, etc.) and common portion sizes.
Extract a structured nutrition estimate from the photo.
Return STRICT JSON only with keys: food_items (array of {name, quantity, unit}), calories, protein_g, carbs_g, fat_g, fiber_g, sodium_mg, sugars_g, notes.
User metadata: ${JSON.stringify(metadata || {})}`;
	const imagePart = { inlineData: { data: imageBase64, mimeType: 'image/jpeg' } };
	const result = await model.generateContent([
		{ text: prompt },
		imagePart,
	]);
	const text = result.response?.text?.() || '';
	const json = extractFirstJsonObject(text);
	return json || { calories: null };
}

async function generateDailyPlan({ userProfile, dateIso }) {
	const genAI = getClient();
	const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
	const region = getRegionFromProfile(userProfile);
	const prompt = `You are a nutrition planner specializing in Indian regional cuisines (region focus: ${region}).
Given this user profile and goals, generate a culturally appropriate daily meal plan for ${dateIso}.
Use typical Indian dishes and portion sizes, respecting dietary restrictions and preferences.
Respond with STRICT JSON only:
{ "meal_plan": { "date": "${dateIso}", "items": [ { "id": "string", "name": "string", "meal_type": "breakfast|lunch|dinner|snack", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "cooking_time": number, "cuisine": "${region}|indian|...", "dietary_restrictions": ["..."] } ] } }
User profile: ${JSON.stringify(userProfile || {})}`;
	const result = await model.generateContent([{ text: prompt }]);
	const text = result.response?.text?.() || '';
	const json = extractFirstJsonObject(text);
	return json?.meal_plan || null;
}

async function browseRecipes({ userProfile, filters }) {
	const genAI = getClient();
	const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
	const region = getRegionFromProfile(userProfile);
	const prompt = `Suggest Indian recipes with regional emphasis (${region}).
Respect user's dietary restrictions and preferences. Prefer readily available local ingredients.
Return STRICT JSON only:
{ "list_of_recipes": [ { "id": "string", "name": "string", "meal_type": "breakfast|lunch|dinner|snack", "calories": number, "protein_g": number, "carbs_g": number, "fat_g": number, "cooking_time": number, "cuisine": "${region}|indian|...", "dietary_restrictions": ["..."] } ] }
User: ${JSON.stringify(userProfile || {})}
Filters: ${JSON.stringify(filters || {})}`;
	const result = await model.generateContent([{ text: prompt }]);
	const text = result.response?.text?.() || '';
	const json = extractFirstJsonObject(text);
	return json?.list_of_recipes || [];

}

async function coachChat({ userContext, messageText }) {
	const genAI = getClient();
	const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
	const prompt = `You are a supportive nutrition and fitness coach. Be concise and actionable.
User context: ${JSON.stringify(userContext || {})}
Message: ${JSON.stringify(messageText)}
Reply as plain text.`;
	const result = await model.generateContent([{ text: prompt }]);
	return result.response?.text?.() || '';
}

module.exports = {
	analyzeMealFromImage,
	generateDailyPlan,
	browseRecipes,
	coachChat,
};


