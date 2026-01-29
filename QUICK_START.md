# Quick Start Guide - Juji Chatbot Integration

## 🚀 Get Started in 5 Minutes

### Step 1: Get Your Juji API Key (2 minutes)

1. Go to https://juji.io and login
2. Click your profile/avatar → **Account Settings**
3. Click **APIKEY** section
4. Click **"Generate New API Key"**
5. **COPY THE KEY IMMEDIATELY** (it's only shown once!)

### Step 2: Get Your Engagement ID (1 minute)

1. In Juji dashboard, go to your chatbot project
2. Look in the URL or project settings for your engagement ID
3. Copy the engagement ID

### Step 3: Configure .env File (1 minute)

Open the `.env` file in your project and add:

```env
# Juji Chatbot Configuration
JUJI_ENGAGEMENT_ID=paste-your-engagement-id-here
JUJI_API_KEY=paste-your-api-key-here
```

**Example:**
```env
JUJI_ENGAGEMENT_ID=5f8d7e6c-1234-5678-90ab-cdef12345678
JUJI_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 4: Install & Start (1 minute)

```bash
# Install new dependencies
npm install

# Start the server
npm start
```

You should see:
```
🚀 Sales Coach API running on port 3000
📊 Managing 199 items
🌐 CORS enabled for all origins
```

### Step 5: Test It! (30 seconds)

**Test 1: Check Authentication**
```bash
curl http://localhost:3000/api/juji/test-auth
```

Expected: `{"success": true, ...}`

**Test 2: Try the Chat**
1. Open http://localhost:3000 in browser
2. Login (default: admin / password123)
3. Click **"💬 Chat with AI"** button
4. Wait for green **"Connected"** status
5. Type "Hello" and press Enter
6. You should see a bot response!

---

## ✅ You're Done!

The chatbot is now integrated and working. Try these queries:

- "show me WESTCO products"
- "find chocolate items under $100"
- "brownie mixes"
- "items between $50 and $200"

---

## 🆘 Troubleshooting

### "Juji chatbot not configured" Error
- Check your `.env` file has both `JUJI_API_KEY` and `JUJI_ENGAGEMENT_ID`
- Make sure there are no extra spaces or quotes around the values
- Restart the server: `npm start`

### "Connection Error" in Browser
- Test auth endpoint: `curl http://localhost:3000/api/juji/test-auth`
- If it fails, regenerate your API key in Juji dashboard
- Update `.env` file with new key
- Restart server

### Can't Find API Key
- API keys are only shown once when generated
- If you lost it, generate a new one:
  1. Go to Juji.io → Account Settings → APIKEY
  2. Generate New API Key
  3. Copy it immediately
  4. Update `.env` file

---

## 📚 More Information

- **Detailed Setup**: See `CHATBOT_SETUP.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: See `CLAUDE.md`

---

## 🎉 Next Steps

1. **Configure your Juji chatbot** in the Juji dashboard
2. **Train the bot** to handle product-related questions
3. **Test various queries** to see how it responds
4. **Deploy to production** (add env vars to Render dashboard)

Enjoy your new AI-powered assistant! 🤖
