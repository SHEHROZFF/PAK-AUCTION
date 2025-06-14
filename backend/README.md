# Auction Site Backend

A basic Node.js backend API for the auction site with security, CORS, and rate limiting.

## Features

- ✅ Express.js server
- ✅ CORS configuration
- ✅ Security middleware (Helmet)
- ✅ Rate limiting
- ✅ Request logging
- ✅ Error handling
- ✅ Health check endpoint

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
# Create .env file with:
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

3. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

- `GET /` - API information
- `GET /health` - Health check

## Configuration

The server uses the following default settings:
- Port: 5000
- CORS Origin: http://localhost:3000
- Rate Limit: 100 requests per 15 minutes per IP

## Security Features

- Helmet.js for security headers
- Rate limiting to prevent abuse
- CORS configuration
- Request size limits
- Error handling 