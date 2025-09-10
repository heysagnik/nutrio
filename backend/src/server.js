const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') });

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const usersRouter = require('./routes/users');
const dataRouter = require('./routes/data');
const recommendationsRouter = require('./routes/recommendations');
const { connectToDatabase } = require('./db/connection');
const progressRouter = require('./routes/progress');
const coachRouter = require('./routes/coach');
const feedbackRouter = require('./routes/feedback');
const nutritionRouter = require('./routes/nutrition');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/users', usersRouter);
app.use('/api/data', dataRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/progress', progressRouter);
app.use('/api/coach', coachRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/nutrition', nutritionRouter);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const message = err.message || 'Internal Server Error';
	res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 4000;

connectToDatabase()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server listening on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB:', err?.message || err);
		process.exit(1);
	});


