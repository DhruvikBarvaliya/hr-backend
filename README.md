# 📘 HR Backend – Node.js, Express, MongoDB

A production-ready Human Resource Management backend system built using **Node.js**, **Express 5**, **MongoDB**, and **Mongoose**.

This backend handles:

- Employees
- Leaves (paid, sick, half-day, flexible hours)
- Holidays
- Clients (with encrypted credentials)
- Authentication (JWT)
- Role-based access
- Cron scheduler for monthly leave accrual
- Business-day logic
- Logging, testing, Swagger docs, Husky Git hooks
- Fully linted with Airbnb ESLint

## 🚀 Features

### ✔ HR Modules
- Employee management
- Leave system (apply, approve, reject, half-day, flexible hours)
- 1 leave/month accrual + carry forward
- Holiday calendar management
- Client credential storage (AES-256 encryption)

### ✔ System Features
- JWT Auth
- Role-based Access Control
- Swagger API docs
- Winston logging + Morgan HTTP logs
- Business-day calculation utility
- Monthly cron job for leave accrual
- Jest + Supertest test suite
- Husky pre-commit hook
- ESLint Airbnb standard

## 🛠️ Tech Stack

| Layer | Technology |
|------|------------|
| Backend | Node.js + Express 5 |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JWT |
| Logging | Winston + Morgan |
| Scheduler | node-cron |
| Validation | Joi |
| Documentation | Swagger |
| Testing | Jest + Supertest |
| Linting | ESLint (Airbnb) |
| Git Hooks | Husky |

## 📁 Project Structure

```
hr-backend/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── tests/
├── .env
├── package.json
├── .eslintrc.js
├── .husky/
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=4000
ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/hrdb
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ENC_KEY=32_CHARACTER_AES256_KEY
ACCRUAL_CRON=5 0 1 * *
TIMEZONE=Asia/Kolkata
DEFAULT_LEAVE_PER_MONTH=1
MAX_CARRY_FORWARD=12
FLEX_HOURS_PER_MONTH=6
WEEKEND_DAYS=0,6
```

## 📦 Installation

```bash
git clone https://github.com/your-username/hr-backend.git
cd hr-backend
npm install
npm run dev
```

## 📚 Swagger API Docs
```
http://localhost:4000/api/docs
```

## 🔐 Authentication

### Register
```
POST /api/v1/auth/register
```

### Login
```
POST /api/v1/auth/login
```

Response:
```json
{ "token": "JWT_TOKEN" }
```

Use in header:
```
Authorization: Bearer {{token}}
```

## 🧩 API Modules

- Employees
- Leaves
- Holidays
- Clients

## ⏱ Monthly Leave Accrual

Cron:  
```
ACCRUAL_CRON=5 0 1 * *
```

Manual:
```
POST /api/v1/leaves/accrue-now
```

## 📆 Business Day Logic

- Weekend detection
- Holiday detection
- Range counting

## 🧪 Testing

```bash
npm test
```

## 🧹 Linting

```bash
npm run lint
npm run lint:fix
```

## 🤝 Contributing

```bash
git checkout -b feature/my-feature
```

## 📬 Support

Ask for Docker, Swagger, CI/CD, or frontend setup anytime.
