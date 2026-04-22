# Employee Management Backend

## Setup

1. Install dependencies: `npm install`
2. Set up MongoDB and update `MONGO_URI` in `.env`
3. Set `JWT_SECRET` in `.env` to a secure random string
4. Run: `npm start` or `npm run dev` for development

## Endpoints

- **POST** `/api/auth/register` - Register a new user
  - Body: `{ "mobile": "string", "password": "string", "fullName": "string" }`
  - Response: `{ "message": "User registered successfully" }`

- **POST** `/api/auth/login` - Login user
  - Body: `{ "mobile": "string", "password": "string" }`
  - Response: `{ "token": "jwt_token_here" }`