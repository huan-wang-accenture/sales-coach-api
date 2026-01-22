# Sales Coach API

A RESTful API for managing sales coach inventory data with full CRUD operations.

## 🎯 Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔍 Advanced search functionality
- 🏷️ Category filtering
- 🔐 JWT-based authentication for secure access
- 🌐 CORS enabled for public access
- 📊 Manage 199 product items across 8 categories
- 🚀 Easy deployment to multiple platforms

## 📦 Quick Start

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory (copy from `.env.example`):

```bash
cp .env.example .env
```

**Important:** Change the default credentials in production:
- `JWT_SECRET`: Use a strong random string
- `ADMIN_USERNAME`: Your desired username
- `ADMIN_PASSWORD_HASH`: Generate using the command in `.env.example`

### Run Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

### Development Mode (with auto-reload)

```bash
npm run dev
```

## 🔐 Authentication

All API endpoints (except login) require JWT authentication.

### Login to Get Access Token

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

### Using the Token

Include the token in the `Authorization` header for all requests:

```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

## 🌐 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | Get access token | No |
| GET | `/api/items` | Get all items | Yes |
| GET | `/api/categories` | Get all categories | Yes |
| GET | `/api/items/:id` | Get item by ID | Yes |
| GET | `/api/items/sku/:sku` | Get item by SKU | Yes |
| GET | `/api/items/category/:category` | Get items by category | Yes |
| GET | `/api/items/search?q=query` | Search items | Yes |
| POST | `/api/items` | Create new item | Yes |
| PUT | `/api/items/:id` | Update item | Yes |
| DELETE | `/api/items/:id` | Delete item | Yes |

## 📚 Example Usage

### Step 1: Login
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

Save the token from the response.

### Step 2: Use the Token in Requests

### Get All Items
```bash
curl http://localhost:3000/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Search Items
```bash
curl "http://localhost:3000/api/items/search?q=chocolate" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create New Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "SKU": "12345",
    "PACK": "BAG",
    "SIZE": "50#",
    "BRAND": "WESTCO",
    "ITEM": "NEW PRODUCT",
    "CATEGORY": "Cat 5 Mix Brownie",
    "PRICE": "199"
  }'
```

### Update Item
```bash
curl -X PUT http://localhost:3000/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"PRICE": "250"}'
```

### Delete Item
```bash
curl -X DELETE http://localhost:3000/api/items/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions to:
- Render.com (FREE)
- Railway.app (FREE)
- Fly.io (FREE)
- Vercel
- Heroku

## 📊 Data Structure

Each item contains:
- `id` - Unique identifier
- `SKU` - Stock Keeping Unit
- `PACK` - Package type
- `SIZE` - Package size
- `BRAND` - Brand name
- `ITEM` - Product name
- `CATEGORY` - Product category
- `PRICE` - Price

## 🔧 Tech Stack

- Node.js
- Express.js
- JWT (JSON Web Tokens) for authentication
- bcrypt for password hashing
- CORS middleware

## ⚠️ Important Notes

- Data is currently stored in-memory (resets on server restart)
- For production, consider adding a database (MongoDB, PostgreSQL, etc.)
- **Security**: Change default credentials before deploying to production
- JWT tokens expire after 24 hours
- Store your `.env` file securely and never commit it to version control

## 📝 License

MIT
