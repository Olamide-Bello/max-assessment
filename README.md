# Virtual Account Management System

## Overview
This project is an implementation of a Virtual Account Management System, built as part of a technical assessment. The system integrates with Safehaven's Virtual Account API to create and manage virtual accounts for users.

## Features
- User Authentication (Register/Login)
- Virtual Account Creation
- Transaction History
- Webhook Integration for Payment Notifications
- Settlement Account Management

## Tech Stack
- Node.js & Express.js
- MongoDB with Mongoose
- Docker & Docker Compose
- Jest for Testing
- JWT for Authentication

## Prerequisites
- Node.js (v18 or higher)
- MongoDB
- Docker and Docker Compose
- NPM or Yarn

## Project Structure
```
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares
│   ├── models/        # Mongoose models
│   ├── routes/        # Express routes
│   ├── services/      # Business logic
│   ├── tests/         # Test files
│   └── server.js      # App entry point
├── .env               # Environment variables
├── Dockerfile         # Docker configuration
├── docker-compose.yml # Docker compose configuration
└── package.json
```

## Getting Started

### Environment Variables
Copy the `.env.example` to `.env` and fill in your credentials:
```
PORT=5000
MONGO_URI=mongodb://admin:secret@localhost:27017/maxim_db?authSource=admin
JWT_SECRET=your_jwt_secret
SAFEHAVEN_API_KEY=your_api_key
SAFEHAVEN_API_URL=https://api.sandbox.safehavenmfb.com
SAFEHAVEN_CLIENT_ID=your_client_id
SAFEHAVEN_ENCODED_CLIENT_ASSERTION=your_client_assertion
CALLBACK_URL=your_callback_url
SETTLEMENT_BANK_CODE=your_bank_code
SETTLEMENT_ACCOUNT_NUMBER=your_account_number
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd maxim-assessment
```

2. Install dependencies:
```bash
npm install
```

3. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

### Docker Setup
```bash
# Build and run containers
docker-compose up -d

# Stop containers
docker-compose down
```

## Testing
```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Virtual Account Endpoints
- `POST /api/banking/virtual-account` - Create virtual account
- `GET /api/banking/transactions` - Get transaction history

### Webhook Endpoints
- `POST /api/webhooks/safehaven` - Payment notification webhook

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License
This project is licensed under the ISC License.
