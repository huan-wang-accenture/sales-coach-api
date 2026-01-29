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
- `JUJI_API_URL`: Juji chat URL base (e.g., https://juji.ai/pre-chat or https://juji.ai/chat)
- `JUJI_ENGAGEMENT_ID`: Your Juji engagement ID (required for chatbot)
- `JUJI_API_KEY`: Your Juji API key (required for chatbot - currently unused but kept for future use)

To generate a new password hash:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10, (err, hash) => console.log(hash));"
```

To obtain your Juji API key:
1. Login to https://juji.io
2. Go to Account settings (click your profile/avatar)
3. Navigate to "APIKEY" section
4. Click "Generate New API Key"
5. **IMPORTANT**: Copy the key immediately - it's only shown once!
6. Paste into your .env file

## Architecture

### Monolithic Structure
The entire application lives in a single `server.js` file. There are no separate route handlers, controllers, models, or middleware directories.

### Authentication
- **JWT-based authentication**: All API endpoints (except login) require a valid JWT token
- **Password hashing**: Uses bcrypt with salt rounds of 10
- **Token expiration**: Tokens expire after 7 days
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
| POST | `/api/items/filter` | **Filter with body params** (item, brand, category, minPrice, maxPrice) - case-insensitive contains | Yes |
| POST | `/api/items/visualize` | **Generate PNG visualization** (pie chart, histogram, table) from items data | Yes |
| POST | `/api/items` | Create new product (requires: SKU, ITEM, CATEGORY, PRICE) | Yes |
| PUT | `/api/items/:id` | Update product (supports partial updates) | Yes |
| DELETE | `/api/items/:id` | Delete product | Yes |

### Chatbot Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/chatbot/start-session` | Get Juji chat URL for iframe embedding | Yes |
| GET | `/api/chatbot/session` | Get current chat session info | Yes |
| DELETE | `/api/chatbot/end-session` | Clean up chat session | Yes |
| POST | `/api/chatbot/search-products` | Natural language product search (available but not used by iframe) | Yes |

### Authentication Flow
1. **Login**: POST to `/api/login` with `{"username": "admin", "password": "password123"}`
2. **Receive Token**: Response contains JWT token with 7-day expiration
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
  "expiresIn": "7d"
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

**Filter Products with Multiple Criteria (POST with Body Parameters):**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "item": "MIX",
    "brand": "WESTCO",
    "category": "Cat 6",
    "minPrice": 50,
    "maxPrice": 300
  }'
```

**Filter Endpoint Details:**
- **Method**: POST (accepts parameters in request body - read-only, does NOT modify data)
- **All parameters are optional** - omit any you don't need
- **Case-insensitive contains matching** - searches for partial matches
- **Combine any parameters** - all filters work together simultaneously

**Complete Parameter Reference:**

| Parameter | Type | Description | Matching | Example Values |
|-----------|------|-------------|----------|----------------|
| `item` | string | Search in Item name | Case-insensitive contains | `"MIX"`, `"CHOCOLATE"`, `"BISCUIT"` |
| `brand` | string | Filter by Brand | Case-insensitive contains | `"WESTCO"`, `"NESTLE"`, `"CARAVA"` |
| `category` | string | Filter by Category | Case-insensitive contains | `"Cat 6"`, `"Brownie"`, `"Chocolate"` |
| `minPrice` | number | Minimum price (≥) | Greater than or equal | `50`, `100`, `200` |
| `maxPrice` | number | Maximum price (≤) | Less than or equal | `300`, `500`, `1000` |

**Examples:**
- `item: "MIX"` finds "BUTTERMILK BISCUIT MIX", "CAKE MIX", "BROWNIE MIX"
- `brand: "west"` finds "WESTCO" (partial match, case-insensitive)
- `category: "Cat 6"` finds "Cat 6 Mix Cookie-Biscuit-Pancake-Churro"
- `minPrice: 100, maxPrice: 300` finds items priced between $100-$300

### Filter Endpoint Usage Examples

**Example 1: Search by Item Name**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"item": "CHOCOLATE"}'
```

**Example 2: Filter by Brand**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"brand": "WESTCO"}'
```

**Example 3: Price Range - Items between $100 and $300**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"minPrice": 100, "maxPrice": 300}'
```

**Example 4: Price Range - Items under $50**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"maxPrice": 50}'
```

**Example 5: Price Range - Items over $200**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"minPrice": 200}'
```

**Example 6: Combined Filters - "BISCUIT" from "WESTCO" priced ≥ $200**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"item": "BISCUIT", "brand": "WESTCO", "minPrice": 200}'
```

**Example 7: All Filters Combined**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "item": "CHOCOLATE",
    "brand": "NESTLE",
    "category": "Cat 50",
    "minPrice": 50,
    "maxPrice": 200
  }'
```

**Response Format:**
```json
{
  "success": true,
  "count": 2,
  "filters": {"item": "BISCUIT", "brand": "WESTCO", "minPrice": 200},
  "data": [
    {
      "id": 0,
      "SKU": "10050",
      "PACK": "BAG",
      "SIZE": "50#",
      "BRAND": "WESTCO",
      "ITEM": "BUTTERMILK BISCUIT MIX",
      "CATEGORY": "Cat 6 Mix Cookie-Biscuit-Pancake-Churro",
      "PRICE": "212"
    },
    {
      "id": 1,
      "SKU": "10058",
      "PACK": "BAG",
      "SIZE": "50#",
      "BRAND": "WESTCO",
      "ITEM": "BISCUIT AND SCONE MIX S/O ",
      "CATEGORY": "Cat 6 Mix Cookie-Biscuit-Pancake-Churro",
      "PRICE": "203"
    }
  ]
}
```

### Visualization Endpoint

The `/api/items/visualize` endpoint generates a PNG image with visualizations of your product data.

**What it generates:**
- **Pie Chart**: Distribution of products by brand (top 10 brands)
- **Histogram**: Price distribution across 10 bins
- **Table**: Detailed product information (ITEM, SKU, PACK, SIZE, BRAND, PRICE) - shows up to 30 records

**Input Format:**
```json
{
  "data": [
    {
      "id": 0,
      "SKU": "10050",
      "PACK": "BAG",
      "SIZE": "50#",
      "BRAND": "WESTCO",
      "ITEM": "BUTTERMILK BISCUIT MIX",
      "CATEGORY": "Cat 6 Mix Cookie-Biscuit-Pancake-Churro",
      "PRICE": "212"
    },
    ...more items...
  ]
}
```

**Output:** PNG image (1200x1600 pixels, ~250KB)

#### Usage Example 1: Visualize Filtered Data

**Step 1: Filter items**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "brand": "WESTCO",
    "minPrice": 100,
    "maxPrice": 300
  }' > filtered_data.json
```

**Step 2: Generate visualization**
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d @filtered_data.json \
  --output product-visualization.png
```

**Step 3: View the PNG**
```bash
open product-visualization.png  # Mac
xdg-open product-visualization.png  # Linux
start product-visualization.png  # Windows
```

#### Usage Example 2: One-Line Command

```bash
# Get token
TOKEN=$(curl -s -X POST https://sales-coach-api-xtzh.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' | jq -r '.token')

# Filter and visualize in one pipeline
curl -s -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "chocolate"}' | \
jq '{data: .data}' | \
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output chocolate-products.png
```

#### Usage Example 3: Visualize All Products

```bash
# Get all items and visualize
curl -s https://sales-coach-api-xtzh.onrender.com/api/items \
  -H "Authorization: Bearer $TOKEN" | \
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output all-products.png
```

#### Image Specifications

| Property | Value |
|----------|-------|
| **Dimensions** | 1200 x 1600 pixels |
| **Format** | PNG (RGBA) |
| **File Size** | ~200-300KB |
| **Charts** | 2 charts side-by-side (550x400 each) |
| **Table** | Up to 30 rows displayed |
| **Colors** | 10 distinct colors for pie chart |
| **Background** | White |

#### Notes

- The endpoint accepts the same data format returned by `/api/items` and `/api/items/filter`
- Brand pie chart shows top 10 brands by count
- Price histogram automatically calculates optimal bins
- Table shows first 30 products (indicates if more exist)
- PNG is optimized for both screen display and printing
- Authentication required (JWT token)

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
1. **Authenticate**: Call `/api/login` to get a token (store it for 7 days)
2. **Query Products**:
   - **Recommended**: Use `POST /api/items/filter` with body parameters for flexible, combined filtering
   - Alternative: Use `/api/items/search?q=QUERY` to search all fields
3. **Get Details**: Use `/api/items/:id` or `/api/items/sku/:sku` for specific items
4. **Real-time Sync**: Any changes made in the web UI are immediately reflected in API responses

**Why use POST /api/items/filter for chatbots:**
- Accepts parameters in request body (works with tools that only support one endpoint)
- Combine multiple criteria in one request (item, brand, category, price range)
- Case-insensitive partial matching (user-friendly)
- Returns exactly what user asks for (precise results)

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

## Chatbot Integration

### Overview
The application includes Juji Cognitive AI Chatbot integration for natural language product queries. Users can interact with an AI assistant to search for products, get recommendations, and learn about inventory.

### Architecture
- **Backend**: Provides session management and returns Juji chat URL to frontend
- **Frontend**: Embeds Juji chatbot using iframe (official Juji integration method)
- **Session Management**: In-memory session storage (no persistence)
- **Integration Method**: iframe embedding - simple, reliable, and officially supported by Juji

### Using the Chatbot

#### Web UI Access
1. Login to the application
2. Click "💬 Chat with AI" button in the navbar
3. Chat panel slides in from the right with Juji chatbot embedded
4. Interact with the AI assistant directly in the iframe
5. Ask about products naturally through the Juji chatbot interface
6. Click "×" button to close the chat panel

#### Chatbot Features
- **Full Juji Experience**: Complete Juji chatbot interface with all features (voice, attachments, etc.)
- **Side Panel UI**: Chat opens in a sliding panel alongside the product table
- **Fresh Sessions**: Each time you open the chat, a new session starts
- **Official Integration**: Uses Juji's official iframe embedding method for maximum reliability
- **Always Up-to-date**: Juji updates automatically - no code changes needed

### Chatbot Configuration

#### Required Environment Variables
```env
JUJI_API_URL=https://juji.ai/pre-chat
JUJI_ENGAGEMENT_ID=your-engagement-id-here
JUJI_API_KEY=your-api-key-here
```

**Note**: The `JUJI_API_URL` should point to your Juji chat endpoint. Common values:
- `https://juji.ai/pre-chat` (for pre-chat engagements)
- `https://juji.ai/chat` (for standard chat engagements)

The backend will construct the full URL as `${JUJI_API_URL}/${JUJI_ENGAGEMENT_ID}` and return it to the frontend, which loads it in an iframe.

#### Obtaining Juji Credentials

**Get your Engagement ID:**
1. Login to https://juji.io
2. Navigate to your chatbot project
3. The engagement ID is in the URL or project settings

**Generate API Key (Optional for current implementation):**
1. Login to https://juji.io
2. Go to Account settings (click your profile/avatar)
3. Navigate to "APIKEY" section
4. Click "Generate New API Key"
5. **IMPORTANT**: Copy the key immediately - it's only shown once!
6. Paste into your .env file

**Note**: The current iframe-based implementation doesn't require API key authentication. The API key is stored for potential future backend API integrations.

#### Testing Juji Configuration
```bash
# Get authentication token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Test chatbot session creation
curl -X POST http://localhost:3000/api/chatbot/start-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "engagementId": "69728a21-fc76-4c23-9d11-734e015f112a",
  "username": "admin",
  "wsAuthToken": "your-api-key",
  "wsUrl": "wss://juji.ai/pre-chat",
  "chatUrl": "https://juji.ai/pre-chat/69728a21-fc76-4c23-9d11-734e015f112a"
}
```

The `chatUrl` field shows the full URL that will be loaded in the iframe.

### Troubleshooting

#### Chat panel opens but iframe is blank
- **Hard refresh browser**: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows) to clear cached JavaScript
- Check browser console (F12) for errors
- Verify `JUJI_API_URL` and `JUJI_ENGAGEMENT_ID` are set correctly in .env
- Test the URL directly: Open `${JUJI_API_URL}/${JUJI_ENGAGEMENT_ID}` in a new browser tab
- Check if engagement is deployed in Juji dashboard at https://juji.io

#### Chatbot URL is incorrect
- Check server logs when opening chat - should show: `Chat URL: https://juji.ai/pre-chat/...`
- Verify .env file has correct `JUJI_API_URL` (either `/pre-chat` or `/chat`)
- Restart server after changing .env: `npm start`
- Test endpoint returns correct URL: `curl -X POST http://localhost:3000/api/chatbot/start-session -H "Authorization: Bearer <token>"`

#### iframe shows "Unknown server resource" or 404
- Wrong `JUJI_API_URL` - try switching between:
  - `https://juji.ai/pre-chat`
  - `https://juji.ai/chat`
- Verify your engagement ID is correct
- Check if engagement is deployed in Juji dashboard

#### Chat panel doesn't open
- Check browser console for JavaScript errors
- Verify DOM elements exist: `document.getElementById('chatPanel')`
- Check CSS classes: chat panel should have classes `chat-panel` and `open` when clicked
- Hard refresh browser to clear cache

#### Environment variable changes not taking effect
- Restart the server after changing .env: `npm start`
- Kill any existing server processes: `lsof -ti:3000 | xargs kill -9`
- Check dotenv is loading: Look for `[dotenv@...] injecting env` message in server logs

#### Session issues
- Clear localStorage: `localStorage.clear()` in browser console
- Logout and login again
- Check backend session: `curl -H "Authorization: Bearer <token>" http://localhost:3000/api/chatbot/session`
- Restart server to clear in-memory sessions

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
- No refresh token mechanism (tokens expire after 7 days)

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
