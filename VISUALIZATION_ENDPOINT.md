# Visualization Endpoint Troubleshooting Guide

## Quick Test: Verify Canvas Dependencies on Render

I've added a diagnostic endpoint to test if the canvas libraries are working properly on Render.

### Step 1: Get Authentication Token

```bash
TOKEN=$(curl -s -X POST https://sales-coach-api-xtzh.onrender.com/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
```

### Step 2: Test Canvas Dependencies

```bash
curl https://sales-coach-api-xtzh.onrender.com/api/test-canvas \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Canvas dependencies are working correctly",
  "tests": {
    "canvasModule": "OK",
    "createCanvas": "OK",
    "chartJSNodeCanvas": "OK",
    "renderChart": "OK",
    "chartBufferSize": 12345
  }
}
```

**Expected Failure Response (if dependencies missing):**
```json
{
  "success": false,
  "error": "Canvas dependency test failed",
  "details": "Error: Cannot find module 'canvas' native binding...",
  "stack": "..."
}
```

---

## Common Issues and Solutions

### Issue 1: "Cannot find module 'canvas' native binding"

**Problem:** The `canvas` npm package requires native system libraries (Cairo, Pango, etc.) that aren't installed on Render by default.

**Solution A: Use Render Blueprint (Recommended)**

1. Commit the `render.yaml` file I created to your repository
2. In Render Dashboard:
   - Go to your service
   - Click "Settings" → "Build & Deploy"
   - Set **Build Command** to: `npm run build`
   - Redeploy the service

**Solution B: Use Docker (Alternative)**

If Solution A doesn't work, Render's free tier for Node.js may not support native dependencies. You'll need to use Docker:

1. Create a `Dockerfile` in your project root:

```dockerfile
FROM node:18

# Install canvas dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

2. Update Render service to use Docker:
   - In Render Dashboard, edit your service
   - Change **Environment** from "Node" to "Docker"
   - Redeploy

**Solution C: Remove Visualization Feature**

If you can't get native dependencies working on Render's free tier:
- Remove the `/api/items/visualize` endpoint
- Use a client-side visualization library instead (Chart.js in the browser)
- Or upgrade to a paid Render plan that supports Docker

---

### Issue 2: Build succeeds but visualization returns 500 error

**Diagnosis Steps:**

1. Check Render logs:
   - Go to Render Dashboard → Your Service → Logs
   - Look for errors when calling `/api/items/visualize`

2. Test with minimal data:
```bash
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "data": [{
      "id": 1,
      "SKU": "TEST",
      "PACK": "BAG",
      "SIZE": "10#",
      "BRAND": "TEST",
      "ITEM": "TEST ITEM",
      "CATEGORY": "Test",
      "PRICE": "100"
    }]
  }' \
  --output test.png
```

3. Check file size:
```bash
ls -lh test.png
```
- Should be ~200-300KB
- If 0 bytes or error, check Render logs for details

---

## Deployment Checklist

After deploying to Render with the updated configuration:

- [ ] Push `render.yaml` to GitHub
- [ ] Push updated `package.json` to GitHub
- [ ] Redeploy service on Render (automatic if auto-deploy enabled)
- [ ] Wait for build to complete (5-10 minutes)
- [ ] Test diagnostic endpoint: `/api/test-canvas`
- [ ] Test visualization endpoint: `/api/items/visualize`
- [ ] Check Render logs for any errors

---

## Testing the Visualization Endpoint

Once canvas dependencies are working:

### Test with filtered data:

```bash
# Step 1: Filter items
curl -s -X POST https://sales-coach-api-xtzh.onrender.com/api/items/filter \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand": "WESTCO", "minPrice": 100}' > filtered.json

# Step 2: Generate visualization
cat filtered.json | \
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output visualization.png

# Step 3: View the image
open visualization.png  # Mac
# or
xdg-open visualization.png  # Linux
```

### Test with all items:

```bash
curl -s https://sales-coach-api-xtzh.onrender.com/api/items \
  -H "Authorization: Bearer $TOKEN" | \
curl -X POST https://sales-coach-api-xtzh.onrender.com/api/items/visualize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output all-products.png
```

---

## Juji Integration Body Configuration

For the Juji API platform body configuration:

**Key:** `data`

**Value:** Reference the previous API call's response data. Exact syntax depends on Juji's variable system:

- Option 1: `{{filterResults.data}}`
- Option 2: `{{previous.data}}`
- Option 3: `{{response.data}}` (check Juji docs for correct syntax)

The body should be structured as:
```json
{
  "data": [array of product objects from previous call]
}
```

### Displaying the Image in Juji

The endpoint now supports two response formats:

**1. JSON format with base64 image (for Juji chatbot)**

Add to the **Headers** tab in Juji:
```
Accept: application/json
```

Or add query parameter to the URL:
```
https://sales-coach-api-xtzh.onrender.com/api/items/visualize?format=json
```

Response will be:
```json
{
  "success": true,
  "message": "Generated visualization for 13 items",
  "image": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "imageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "format": "png",
  "items": 13
}
```

To display in Juji chatbot:
- Use the `image` or `imageUrl` field from the response
- Configure Juji to render it as an image (check Juji's documentation for displaying images)
- The data URI can be used directly in HTML: `<img src="{{response.image}}" />`

**2. Binary PNG format (for direct download)**

If no `Accept: application/json` header, returns raw PNG binary data suitable for saving to file.

---

## Need Help?

1. **Check diagnostic endpoint first**: `/api/test-canvas`
2. **Check Render logs**: Look for build errors or runtime errors
3. **Verify environment**: Node 18+ required for best canvas compatibility
4. **Consider alternatives**: If free tier doesn't support native deps, use client-side visualization

---

## Alternative: Client-Side Visualization

If server-side visualization proves difficult on Render's free tier, consider:

1. Return JSON data to Juji
2. Use Juji's display capabilities to show data
3. Or build a simple web page that loads Chart.js and visualizes client-side
