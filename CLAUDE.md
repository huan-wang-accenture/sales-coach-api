# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sales Coach API - A Node.js/Express REST API for managing bakery/confectionery product inventory with 199 products across 8 categories. Features JWT-based authentication for secure access.

## Development Commands

### Running the Application
```bash
# Production mode
npm start

# Development mode (auto-reload with nodemon)
npm run dev
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

### Installation
```bash
npm install
```

### Configuration
Create a `.env` file from the example:
```bash
cp .env.example .env
```

Environment variables:
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for signing JWT tokens
- `ADMIN_USERNAME`: Admin username (default: admin)
- `ADMIN_PASSWORD_HASH`: Bcrypt hash of admin password

To generate a new password hash:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10, (err, hash) => console.log(hash));"
```

## Architecture

### Monolithic Structure
The entire application lives in a single `server.js` file. There are no separate route handlers, controllers, models, or middleware directories.

### Authentication
- **JWT-based authentication**: All API endpoints (except login) require a valid JWT token
- **Password hashing**: Uses bcrypt with salt rounds of 10
- **Token expiration**: Tokens expire after 24 hours
- **Authentication middleware**: `authenticateToken` function validates JWT on protected routes

### Data Storage
- **In-memory storage**: All 199 products stored in a hardcoded JavaScript array (lines 11-211 in server.js)
- **Data persistence**: None - data resets on server restart
- **Data structure**: Each item contains: `id`, `SKU`, `PACK`, `SIZE`, `BRAND`, `ITEM`, `CATEGORY`, `PRICE`

### API Design Pattern
- RESTful endpoints under `/api` prefix
- Consistent JSON response format with `success`, `count`/`data`, and optional `error` fields
- CORS enabled for all origins
- Express middleware stack: CORS → JSON parsing → URL-encoded form parsing → Authentication (on protected routes)

### Route Organization in server.js
- Lines 1-35: Dependencies and authentication middleware setup
- Root endpoint: API documentation
- POST /api/login: Authentication endpoint (no token required)
- GET routes: items, categories, search, by ID/SKU/category (all require authentication)
- POST route: Create item (requires authentication)
- PUT route: Update item (requires authentication)
- DELETE route: Delete item (requires authentication)
- Error handlers: 404 and 500
- Server initialization

## API Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/login` | Get JWT access token | No |
| GET | `/api/items` | Retrieve all 199 products | Yes |
| GET | `/api/categories` | Get 8 unique categories | Yes |
| GET | `/api/items/:id` | Get product by numeric ID | Yes |
| GET | `/api/items/sku/:sku` | Get product by SKU code | Yes |
| GET | `/api/items/category/:category` | Filter by category (case-insensitive) | Yes |
| GET | `/api/items/search?q=query` | Full-text search across all fields | Yes |
| POST | `/api/items` | Create new product (requires: SKU, ITEM, CATEGORY, PRICE) | Yes |
| PUT | `/api/items/:id` | Update product (supports partial updates) | Yes |
| DELETE | `/api/items/:id` | Delete product | Yes |

### Authentication Flow
1. **Login**: POST to `/api/login` with `{"username": "admin", "password": "password123"}`
2. **Receive Token**: Response contains JWT token with 24-hour expiration
3. **Use Token**: Include in Authorization header: `Authorization: Bearer <token>`
4. **Access Protected Routes**: All other endpoints require this header

## Using the Deployed Application

### Web UI Access (Render)
The application is deployed at: **https://sales-coach-api-xtzh.onrender.com**

#### Accessing the Web Interface
1. Open https://sales-coach-api-xtzh.onrender.com in your browser
2. You'll see a login page
3. Enter credentials:
   - Username: `admin`
   - Password: `password123`
4. After login, you can:
   - View all products in a table
   - Search products by any field
   - Filter by category
   - Add new products
   - Edit existing products
   - Delete products

### API Access via curl

#### Step 1: Get Authentication Token
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": "24h"
}
```

Save the `token` value for use in subsequent requests.

#### Step 2: Use Token in API Requests

**Get All Items:**
```bash
curl https://sales-coach-api-xtzh.onrender.com/api/items \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Search for Products:**
```bash
# Search for "BUTTERMILK BISCUIT MIX"
curl "https://sales-coach-api-xtzh.onrender.com/api/items/search?q=BUTTERMILK%20BISCUIT%20MIX" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Search for any text (e.g., "chocolate")
curl "https://sales-coach-api-xtzh.onrender.com/api/items/search?q=chocolate" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Product by ID:**
```bash
curl https://sales-coach-api-xtzh.onrender.com/api/items/0 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get Product by SKU:**
```bash
curl https://sales-coach-api-xtzh.onrender.com/api/items/sku/10050 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Get All Categories:**
```bash
curl https://sales-coach-api-xtzh.onrender.com/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by Category:**
```bash
curl "https://sales-coach-api-xtzh.onrender.com/api/items/category/Cat%206%20Mix%20Cookie-Biscuit-Pancake-Churro" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Create New Product:**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items \
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

**Update Product:**
```bash
curl -X PUT https://sales-coach-api-xtzh.onrender.com/api/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"PRICE": "250"}'
```

**Delete Product:**
```bash
curl -X DELETE https://sales-coach-api-xtzh.onrender.com/api/items/1 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Automated Token Management (Bash Script)

For convenience, you can automatically get the token and use it:

```bash
# Get token and store in variable
TOKEN=$(curl -s -X POST https://sales-coach-api-xtzh.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' \
  | grep -o '"token":"[^"]*' | grep -o '[^"]*$')

# Use the token
curl https://sales-coach-api-xtzh.onrender.com/api/items \
  -H "Authorization: Bearer $TOKEN"
```

### Integration with Chatbot

For chatbot integration:
1. **Authenticate**: Call `/api/login` to get a token (store it for 24 hours)
2. **Query Products**: Use `/api/items/search?q=QUERY` to find products
3. **Get Details**: Use `/api/items/:id` or `/api/items/sku/:sku` for specific items
4. **Real-time Sync**: Any changes made in the web UI are immediately reflected in API responses

### Example Product Data

Example item returned from API (BUTTERMILK BISCUIT MIX):
```json
{
  "id": 0,
  "SKU": "10050",
  "PACK": "BAG",
  "SIZE": "50#",
  "BRAND": "WESTCO",
  "ITEM": "BUTTERMILK BISCUIT MIX",
  "CATEGORY": "Cat 6 Mix Cookie-Biscuit-Pancake-Churro",
  "PRICE": "212"
}
```

## Product Categories

The 8 product categories are:
- Cat 3 Mixes, Muffin, Cake
- Cat 4 Mixes Bread Tortilla
- Cat 5 Mix Brownie
- Cat 6 Mix Cookie-Biscuit-Pancake-Churro
- Cat 20 Caravan
- Cat 48 Cocoa-Cocoa Butter
- Cat 49 Branded Chocolate
- Cat 50 Chocolate

## Key Implementation Details

### Authentication Implementation
- **JWT Secret**: Configurable via `JWT_SECRET` environment variable
- **Password Storage**: Passwords are never stored in plain text; only bcrypt hashes
- **Token Validation**: `authenticateToken` middleware checks for Bearer token in Authorization header
- **Default Credentials**: Username: `admin`, Password: `password123` (hash stored in env)

### ID Generation
New items receive `id = Math.max(...items.map(i => i.id), 0) + 1`

### Search Implementation
Full-text search checks all object values with case-insensitive substring matching

### Validation
- Login endpoint validates username and password presence
- POST /api/items validates required fields (SKU, ITEM, CATEGORY, PRICE)
- PUT requests allow partial updates without validation

### Error Handling
- 400: Missing required fields or query parameters
- 401: Missing or invalid authentication token
- 403: Expired or malformed token
- 404: Item not found or invalid endpoint
- 500: Internal server errors

## Production Considerations

### Security
- ✅ **Authentication**: JWT-based authentication implemented
- ⚠️ **Change Default Credentials**: Update `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH`, and `JWT_SECRET` in production
- ⚠️ **Environment Variables**: Never commit `.env` file; configure in deployment platform (Render, etc.)

### Limitations
- No database integration (data is lost on restart)
- Single user authentication (no user management system)
- No rate limiting
- CORS allows all origins
- No refresh token mechanism (tokens expire after 24h)

### Deployment on Render
Required environment variables:
```
JWT_SECRET=<long-random-string>
ADMIN_USERNAME=<your-username>
ADMIN_PASSWORD_HASH=<bcrypt-hash-of-password>
```

Generate new password hash for production:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10, (err, hash) => console.log(hash));"
```

When adding production features, consider:
- Database integration (MongoDB, PostgreSQL) for persistence
- Multi-user authentication with role-based access control
- Rate limiting middleware
- Refresh token implementation
- Audit logging for security events
