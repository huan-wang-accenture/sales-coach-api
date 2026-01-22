# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sales Coach API - A Node.js/Express REST API for managing bakery/confectionery product inventory with 199 products across 8 categories.

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

## Architecture

### Monolithic Structure
The entire application lives in a single `server.js` file (437 lines). There are no separate route handlers, controllers, models, or middleware directories.

### Data Storage
- **In-memory storage**: All 199 products stored in a hardcoded JavaScript array (lines 11-211 in server.js)
- **Data persistence**: None - data resets on server restart
- **Data structure**: Each item contains: `id`, `SKU`, `PACK`, `SIZE`, `BRAND`, `ITEM`, `CATEGORY`, `PRICE`

### API Design Pattern
- RESTful endpoints under `/api` prefix
- Consistent JSON response format with `success`, `count`/`data`, and optional `error` fields
- CORS enabled for all origins
- Express middleware stack: CORS → JSON parsing → URL-encoded form parsing

### Route Organization in server.js
- Lines 214-230: Root endpoint (API documentation)
- Lines 233-317: GET routes (items, categories, search, by ID/SKU/category)
- Lines 320-349: POST route (create item)
- Lines 352-380: PUT route (update item)
- Lines 383-400: DELETE route (delete item)
- Lines 403-417: Error handlers (404 and 500)
- Lines 420-435: Server initialization

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/items` | Retrieve all 199 products |
| GET | `/api/categories` | Get 8 unique categories |
| GET | `/api/items/:id` | Get product by numeric ID |
| GET | `/api/items/sku/:sku` | Get product by SKU code |
| GET | `/api/items/category/:category` | Filter by category (case-insensitive) |
| GET | `/api/items/search?q=query` | Full-text search across all fields |
| POST | `/api/items` | Create new product (requires: SKU, ITEM, CATEGORY, PRICE) |
| PUT | `/api/items/:id` | Update product (supports partial updates) |
| DELETE | `/api/items/:id` | Delete product |

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

### ID Generation
New items receive `id = Math.max(...items.map(i => i.id), 0) + 1` (line 332)

### Search Implementation
Full-text search checks all object values with case-insensitive substring matching (lines 305-309)

### Validation
Only POST requests validate required fields (SKU, ITEM, CATEGORY, PRICE). PUT requests allow partial updates without validation.

### Error Handling
- 400: Missing required fields or query parameters
- 404: Item not found or invalid endpoint
- 500: Internal server errors

## Production Considerations

The README.md notes several limitations for production use:
- No database integration (data is lost on restart)
- No authentication/authorization
- No rate limiting
- CORS allows all origins

When adding production features, consider integrating MongoDB or PostgreSQL for persistence.
