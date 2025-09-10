const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI ;

async function connectToDatabase() {
	if (mongoose.connection.readyState === 1) return mongoose.connection;
	mongoose.set('strictQuery', true);
	await mongoose.connect(MONGO_URI, {
		serverSelectionTimeoutMS: 5000,
	});
	return mongoose.connection;
}

module.exports = { connectToDatabase };


