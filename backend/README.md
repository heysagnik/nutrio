# Nutrio Backend

This is the backend for the Nutrio application. It's a Node.js application using Express.js and MongoDB.

## Backend Setup

To get the backend running locally:

1.  **Clone the repository**

2.  **Install dependencies**

    ```bash
    cd backend
    npm install
    ```

3.  **Set up environment variables**

    Create a `.env` file in the `backend` directory and add the following variables:

    ```
    MONGO_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    GEMINI_API_KEY=<your_gemini_api_key>
    ```

4.  **Run the application**

    For development with auto-reloading:

    ```bash
    npm run dev
    ```

    For production:

    ```bash
    npm start
    ```

    The server will be running on `http://localhost:4000`.

## API Endpoints

The API is documented below.

### Users

#### Register
- **Method**: `POST`
- **URL**: `/api/users/register`
- **Body**:
```json
{
  "email": "postman@example.com",
  "password": "PostmanPass123!",
  "name": "Postman User",
  "age": 30,
  "gender": "female",
  "height": 165,
  "weight": 68,
  "location": "NY",
  "activity_level": "moderate",
  "occupation": "Engineer",
  "sleep_duration": 7,
  "stress_level": "medium",
  "medical_conditions": ["none"],
  "allergies": ["peanut"],
  "dietary_restrictions": ["vegetarian"],
  "medications": [],
  "health_goal": "weight_loss",
  "target_weight": 60,
  "preferred_cuisines": ["italian","mexican"],
  "cooking_skill": "intermediate",
  "dietary_dislikes": ["broccoli"],
  "consent_given": true
}
```

#### Login
- **Method**: `POST`
- **URL**: `/api/users/login`
- **Body**:
```json
{
  "email": "postman@example.com",
  "password": "PostmanPass123!"
}
```

#### Get Profile
- **Method**: `GET`
- **URL**: `/api/users/{{userId}}/profile`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

#### Update Profile
- **Method**: `PUT`
- **URL**: `/api/users/{{userId}}/profile`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "location": "San Francisco",
  "weight": 67
}
```

#### Update Goals
- **Method**: `PUT`
- **URL**: `/api/users/{{userId}}/goals`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{ "health_goal": "muscle_gain", "target_weight": 62 }
```

### Data

#### Log Meal (text)
- **Method**: `POST`
- **URL**: `/api/data/meals`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "meal_type": "breakfast",
  "food_description": "two eggs, toast with butter and orange juice",
  "portion_size": "1 plate",
  "cooking_method": "fried",
  "meal_time": "2025-09-10T08:30:00Z"
}
```
- **Description**: Text-only meal logging (server will parse description; Gemini is used only if image is uploaded).

#### Log Meal (Image Upload, multipart/form-data)
- **Method**: `POST`
- **URL**: `/api/data/meals`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**: `multipart/form-data` with fields: `user_id`, `meal_type`, `portion_size`, `cooking_method`, `meal_time`, `image`.
- **Description**: Multipart form upload example. Set the file `src` to a local image path in Postman. The server will send the image to Gemini 2.5 Flash for structured nutrition extraction. Ensure server has `GEMINI_API_KEY` env var set.

#### Log Activity
- **Method**: `POST`
- **URL**: `/api/data/activities`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "activity_type": "running",
  "duration_minutes": 30,
  "intensity": "moderate",
  "activity_date": "2025-09-10T07:00:00Z"
}
```

#### Log Weight
- **Method**: `POST`
- **URL**: `/api/data/weight`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "weight_kg": 67,
  "log_date": "2025-09-10T09:00:00Z"
}
```

#### Wearables Sync
- **Method**: `POST`
- **URL**: `/api/data/wearables/sync`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "device_data": { "steps": 8500, "heart_rate": 72, "calories_burned": 500, "sleep_quality": "good" }
}
```

### Recommendations

#### Daily Plan
- **Method**: `GET`
- **URL**: `/api/recommendations/daily-plan?user_id={{userId}}&date=2025-09-10`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Description**: Gemini-powered daily plan (server calls Gemini 2.5 Flash).

#### Recipes (browse)
- **Method**: `GET`
- **URL**: `/api/recommendations/recipes?user_id={{userId}}&meal_type=lunch`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Description**: Browse personalized recipes (Gemini generates the list).

#### Recipe Swap
- **Method**: `POST`
- **URL**: `/api/recommendations/recipes/swap`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "meal_plan_id": "mp1",
  "original_item_id": "r2",
  "new_item_id": "r3"
}
```
- **Description**: Swap a recommended item; server validates against Gemini-generated options.

#### Grocery List
- **Method**: `GET`
- **URL**: `/api/recommendations/grocery-list?user_id={{userId}}&start_date=2025-09-09&end_date=2025-09-11`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

### Progress

#### Weight History
- **Method**: `GET`
- **URL**: `/api/progress/weight-history?user_id={{userId}}&start_date=2025-09-01&end_date=2025-09-30`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

#### Nutrient Summary (weekly)
- **Method**: `GET`
- **URL**: `/api/progress/nutrient-summary?user_id={{userId}}&time_frame=weekly&start_date=2025-09-01&end_date=2025-09-30`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

#### Activity Summary (daily)
- **Method**: `GET`
- **URL**: `/api/progress/activity-summary?user_id={{userId}}&time_frame=daily&start_date=2025-09-01&end_date=2025-09-30`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

#### Goals Status
- **Method**: `GET`
- **URL**: `/api/progress/goals-status?user_id={{userId}}`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

### Coach

#### Chat (Gemini)
- **Method**: `POST`
- **URL**: `/api/coach/chat`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{ "user_id": "{{userId}}", "message_text": "I want to lose 5 kg, where should I start?" }
```
- **Description**: Gemini 2.5 Flash powers the coach responses. Keep messages short; server calls Gemini and returns text.

#### Educational Content
- **Method**: `GET`
- **URL**: `/api/coach/educational-content?user_id={{userId}}&category=macros`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`

### Feedback

#### Recommendation Rating
- **Method**: `POST`
- **URL**: `/api/feedback/recommendation-rating`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{
  "user_id": "{{userId}}",
  "recommendation_id": "r2",
  "rating": 5,
  "comment": "Tasty and easy to make"
}
```

#### Adherence
- **Method**: `POST`
- **URL**: `/api/feedback/adherence`
- **Headers**:
  - `Authorization`: `Bearer {{token}}`
- **Body**:
```json
{ "user_id": "{{userId}}", "plan_id": "mp1", "adherence_status": "followed" }
```

### Nutrition

#### Get Food Item
- **Method**: `GET`
- **URL**: `/api/nutrition/food-item/apple123`

#### Search
- **Method**: `GET`
- **URL**: `/api/nutrition/search?query_text=oat&limit=5`
