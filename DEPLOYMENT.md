# Sales Coach API - Deployment Guide

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Server
```bash
npm start
```

The API will be available at `http://localhost:3000`

### 3. Test the API
```bash
# Get all items
curl http://localhost:3000/api/items

# Search items
curl http://localhost:3000/api/items/search?q=chocolate

# Get specific category
curl http://localhost:3000/api/items/category/Cat%205%20Mix%20Brownie
```

---

## 🌐 Deploy to Public Cloud (FREE Options)

### Option 1: Render.com (Recommended - FREE)

1. **Create account** at https://render.com
2. **Create new Web Service**
3. **Connect your GitHub repo** or upload files
4. **Configure:**
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
5. **Deploy** - You'll get a public URL like: `https://sales-coach-api.onrender.com`

**Pros:** Free tier, auto-deploy, custom domains, HTTPS included
**Cons:** Spins down after 15 min inactivity (first request takes ~30s)

### Option 2: Railway.app (FREE)

1. **Create account** at https://railway.app
2. **New Project** → Deploy from GitHub or upload
3. **Auto-detects** Node.js and deploys
4. **Get public URL** like: `https://sales-coach-api.up.railway.app`

**Pros:** Fast, simple, 500 hours free/month
**Cons:** Credit card required (not charged on free tier)

### Option 3: Fly.io (FREE)

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Launch app:**
   ```bash
   fly launch
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

**Pros:** Great performance, edge network
**Cons:** Slightly more complex setup

### Option 4: Vercel (Serverless)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

**Note:** Vercel works best with serverless. You'll need to modify the code slightly.

### Option 5: Heroku (FREE tier ending)

1. **Install Heroku CLI**
2. **Login:**
   ```bash
   heroku login
   ```

3. **Create app:**
   ```bash
   heroku create sales-coach-api
   ```

4. **Deploy:**
   ```bash
   git push heroku main
   ```

**Note:** Heroku removed free tier. Paid plans start at $5/month.

---

## 📡 API Endpoints

### Base URL
```
https://your-deployed-api.com
```

### Endpoints

#### 1. Get All Items
```http
GET /api/items
```
**Response:**
```json
{
  "success": true,
  "count": 199,
  "data": [...]
}
```

#### 2. Get All Categories
```http
GET /api/categories
```
**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": ["Cat 3 Mixes, Muffin, Cake", ...]
}
```

#### 3. Get Item by ID
```http
GET /api/items/:id
```
**Example:** `/api/items/5`

#### 4. Get Item by SKU
```http
GET /api/items/sku/:sku
```
**Example:** `/api/items/sku/10050`

#### 5. Get Items by Category
```http
GET /api/items/category/:category
```
**Example:** `/api/items/category/Cat 50 Chocolate`

#### 6. Search Items
```http
GET /api/items/search?q=query
```
**Example:** `/api/items/search?q=chocolate`

#### 7. Create New Item
```http
POST /api/items
Content-Type: application/json

{
  "SKU": "12345",
  "PACK": "BAG",
  "SIZE": "50#",
  "BRAND": "WESTCO",
  "ITEM": "NEW PRODUCT",
  "CATEGORY": "Cat 5 Mix Brownie",
  "PRICE": "199"
}
```

#### 8. Update Item
```http
PUT /api/items/:id
Content-Type: application/json

{
  "PRICE": "250"
}
```

#### 9. Delete Item
```http
DELETE /api/items/:id
```

---

## 🔗 Integration Examples

### JavaScript (Fetch)
```javascript
// Get all items
fetch('https://your-api.com/api/items')
  .then(res => res.json())
  .then(data => console.log(data));

// Search
fetch('https://your-api.com/api/items/search?q=chocolate')
  .then(res => res.json())
  .then(data => console.log(data));

// Create item
fetch('https://your-api.com/api/items', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    SKU: '99999',
    ITEM: 'Test Product',
    CATEGORY: 'Test Category',
    PRICE: '100'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Python (requests)
```python
import requests

# Get all items
response = requests.get('https://your-api.com/api/items')
items = response.json()

# Search
response = requests.get('https://your-api.com/api/items/search', 
                       params={'q': 'chocolate'})
results = response.json()

# Create item
new_item = {
    'SKU': '99999',
    'ITEM': 'Test Product',
    'CATEGORY': 'Test',
    'PRICE': '100'
}
response = requests.post('https://your-api.com/api/items', 
                        json=new_item)
```

### cURL
```bash
# Get all items
curl https://your-api.com/api/items

# Search
curl "https://your-api.com/api/items/search?q=chocolate"

# Create item
curl -X POST https://your-api.com/api/items \
  -H "Content-Type: application/json" \
  -d '{"SKU":"99999","ITEM":"Test","CATEGORY":"Test","PRICE":"100"}'

# Update item
curl -X PUT https://your-api.com/api/items/5 \
  -H "Content-Type: application/json" \
  -d '{"PRICE":"250"}'

# Delete item
curl -X DELETE https://your-api.com/api/items/5
```

---

## 🔒 Security Considerations

The current API is **public and open**. For production use, consider:

1. **Add Authentication:**
   ```javascript
   // Example with API keys
   app.use((req, res, next) => {
     const apiKey = req.headers['x-api-key'];
     if (apiKey !== process.env.API_KEY) {
       return res.status(401).json({ error: 'Unauthorized' });
     }
     next();
   });
   ```

2. **Rate Limiting:**
   ```bash
   npm install express-rate-limit
   ```

3. **Database:**
   - Currently uses in-memory storage
   - Data resets on server restart
   - For persistence, use MongoDB, PostgreSQL, etc.

---

## 📊 Data Persistence

To add a database (MongoDB example):

```bash
npm install mongoose
```

```javascript
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define schema
const itemSchema = new mongoose.Schema({
  SKU: String,
  PACK: String,
  SIZE: String,
  BRAND: String,
  ITEM: String,
  CATEGORY: String,
  PRICE: String
});

const Item = mongoose.model('Item', itemSchema);

// Replace in-memory array with database queries
app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json({ success: true, data: items });
});
```

---

## 🎯 Best Deployment for Your Needs

**For quick testing:** Render.com (free, easy)
**For production:** Railway.app or Fly.io (better performance)
**For serverless:** Vercel (requires code adaptation)

---

## 🆘 Support

If you encounter issues:
1. Check server logs
2. Verify CORS is enabled
3. Test locally first
4. Check API endpoint URLs

---

## 📝 License

MIT - Feel free to use and modify!
