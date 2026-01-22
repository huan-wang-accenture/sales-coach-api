# Sales Coach API

A RESTful API for managing sales coach inventory data with full CRUD operations.

## 🎯 Features

- ✅ Full CRUD operations (Create, Read, Update, Delete)
- 🔍 Advanced search functionality
- 🏷️ Category filtering
- 🌐 CORS enabled for public access
- 📊 Manage 199 product items across 8 categories
- 🚀 Easy deployment to multiple platforms

## 📦 Quick Start

### Installation

```bash
npm install
```

### Run Locally

```bash
npm start
```

Server runs on `http://localhost:3000`

### Development Mode (with auto-reload)

```bash
npm run dev
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items |
| GET | `/api/categories` | Get all categories |
| GET | `/api/items/:id` | Get item by ID |
| GET | `/api/items/sku/:sku` | Get item by SKU |
| GET | `/api/items/category/:category` | Get items by category |
| GET | `/api/items/search?q=query` | Search items |
| POST | `/api/items` | Create new item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

## 📚 Example Usage

### Get All Items
```bash
curl http://localhost:3000/api/items
```

### Search Items
```bash
curl "http://localhost:3000/api/items/search?q=chocolate"
```

### Create New Item
```bash
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
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
  -d '{"PRICE": "250"}'
```

### Delete Item
```bash
curl -X DELETE http://localhost:3000/api/items/1
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
- CORS middleware

## ⚠️ Important Notes

- Data is currently stored in-memory (resets on server restart)
- For production, consider adding a database (MongoDB, PostgreSQL, etc.)
- No authentication implemented (add for production use)

## 📝 License

MIT
