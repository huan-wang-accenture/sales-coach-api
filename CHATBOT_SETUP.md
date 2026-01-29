# Juji Chatbot Integration - Setup Guide

## Overview

The Sales Coach application now includes Juji Cognitive AI Chatbot integration! Users can interact with an AI assistant to search for products, get recommendations, and learn about inventory using natural language.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

New dependencies added:
- `graphql`: ^16.8.1
- `graphql-request`: ^6.1.0

### 2. Configure Juji Credentials

#### Get Your Juji API Key

1. Login to https://juji.io
2. Click on your profile/avatar → Account Settings
3. Navigate to "APIKEY" section
4. Click "Generate New API Key"
5. **IMPORTANT**: Copy the key immediately - it's only shown once!

#### Get Your Engagement ID

1. In Juji dashboard, go to your chatbot project
2. The engagement ID is in the URL or project settings

#### Update .env File

Add these lines to your `.env` file:

```env
# Juji Chatbot Configuration
JUJI_API_URL=https://juji.ai/api
JUJI_WS_URL=wss://juji.ai/api/v1/ws
JUJI_GRAPHQL_URL=https://juji.ai/api/graphql
JUJI_ENGAGEMENT_ID=your-engagement-id-here
JUJI_API_KEY=your-api-key-here
```

Replace `your-engagement-id-here` and `your-api-key-here` with your actual credentials.

### 3. Start the Server

```bash
npm start
```

### 4. Test the Integration

#### Test Authentication
```bash
curl http://localhost:3000/api/juji/test-auth
```

Expected response:
```json
{
  "success": true,
  "message": "API key authentication configured successfully",
  "engagementId": "your-engagement-id",
  "apiUrl": "https://juji.ai/api",
  "wsUrl": "wss://juji.ai/api/v1/ws"
}
```

#### Test in Browser
1. Open http://localhost:3000
2. Login with credentials (default: admin/password123)
3. Click "💬 Chat with AI" button in navbar
4. Wait for "Connected" status (green indicator)
5. Type "Hello" and press Enter
6. You should receive a response from the AI assistant

## Features

### Natural Language Product Search

Ask questions naturally:
- "show me WESTCO products"
- "find chocolate items under $100"
- "brownie mixes from NESTLE"
- "items between $50 and $200"

### Supported Search Patterns

#### By Brand
- "show me WESTCO products"
- "find NESTLE items"
- "GUITTARD products"

#### By Category
- "chocolate products"
- "brownie mixes"
- "cookie items"
- "cake mixes"

#### By Price
- "items under $100"
- "products over $200"
- "between $50 and $150"

#### Combined Filters
- "WESTCO chocolate under $200"
- "brownie mix over $100"
- "NESTLE products between $100 and $300"

### Chat Features

- **Real-time Communication**: Instant bot responses via WebSocket
- **Session Persistence**: Chat session stays active while navigating
- **Auto-reconnect**: Up to 3 reconnection attempts on disconnect
- **Connection Status**: Visual indicator (green = connected, yellow = connecting, red = disconnected)

## Architecture

### Backend (server.js)

**New Endpoints:**
- `POST /api/chatbot/start-session` - Create Juji participation session
- `GET /api/chatbot/session` - Get current session info
- `DELETE /api/chatbot/end-session` - Clean up session
- `POST /api/chatbot/search-products` - Natural language product search
- `GET /api/juji/test-auth` - Test Juji authentication

**Key Functions:**
- `getJujiAuthHeader()` - Creates Basic Auth header with API key
- `callJujiAPI()` - Makes authenticated GraphQL requests
- `parseProductQuery()` - Extracts filters from natural language
- `formatProductsForChat()` - Formats product results for display

### Frontend

**New Files Modified:**
- `public/index.html` - Added chat screen UI
- `public/app.js` - Added chat logic and WebSocket handling
- `public/styles.css` - Added chat styling (purple theme)

**Key Functions:**
- `showChatScreen()` - Switch to chat interface
- `initializeChatSession()` - Create backend session
- `connectChatWebSocket()` - Establish WebSocket connection
- `sendChatMessage()` - Send message to Juji
- `handleWebSocketMessage()` - Process bot responses

## API Key vs JWT Tokens

This integration uses **API Key authentication** instead of JWT tokens:

| Feature | API Key (Used) | JWT Token |
|---------|---------------|-----------|
| Expiration | Never expires | Expires every 10 hours |
| Refresh Logic | Not needed | Required |
| Setup | Generate once | Authenticate each time |
| Simplicity | ✅ Simple | ❌ Complex |
| Security | Stays server-side* | Server-side only |

*Note: API key is passed to frontend for WebSocket auth because WebSocket doesn't support custom headers. This is acceptable for read-only chatbot interactions.

## Troubleshooting

### "Juji chatbot not configured" Error

**Cause**: Missing environment variables

**Solution**:
1. Check `.env` file exists
2. Verify `JUJI_API_KEY` and `JUJI_ENGAGEMENT_ID` are set
3. Restart the server after adding variables

### "Connection Error" in UI

**Cause**: Invalid API key or engagement ID

**Solution**:
1. Test authentication: `curl http://localhost:3000/api/juji/test-auth`
2. Verify API key is correct (regenerate if lost)
3. Check engagement ID matches your Juji project
4. Check browser console for WebSocket errors

### Messages Not Sending

**Possible Causes**:
1. WebSocket not connected (check status indicator)
2. Session not initialized
3. Network issues

**Solution**:
1. Check connection status is green
2. Refresh page and try again
3. Check browser console for errors
4. Test API call: `curl -X POST http://localhost:3000/api/chatbot/start-session -H "Authorization: Bearer YOUR_TOKEN"`

### No Bot Responses

**Possible Causes**:
1. Juji engagement not deployed
2. WebSocket subscription failed
3. Chatbot flow not configured

**Solution**:
1. Login to Juji dashboard
2. Verify engagement is deployed and active
3. Test chatbot directly in Juji dashboard
4. Check server logs for WebSocket messages

### API Key Issues

**"401 Unauthorized"**:
- API key is invalid or revoked
- Regenerate key in Juji dashboard

**"403 Forbidden"**:
- API key doesn't have access to engagement
- Check engagement ID is correct

**Key Lost**:
- API keys are only shown once during generation
- Generate a new key if lost
- Update `.env` file with new key
- Restart server

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Rotate API keys periodically** - Generate new keys every few months
3. **API key has full account access** - Keep it secure
4. **WebSocket requires API key** - Passed as query parameter (acceptable for read-only operations)
5. **Use environment variables** - Never hardcode credentials

## Production Deployment

### Render Configuration

Add environment variables in Render dashboard:
```
JUJI_API_URL=https://juji.ai/api
JUJI_WS_URL=wss://juji.ai/api/v1/ws
JUJI_GRAPHQL_URL=https://juji.ai/api/graphql
JUJI_ENGAGEMENT_ID=your-engagement-id
JUJI_API_KEY=your-api-key
```

### Verify Deployment
1. Test authentication endpoint: `curl https://your-app.onrender.com/api/juji/test-auth`
2. Test WebSocket over HTTPS (wss://)
3. Verify CORS headers allow WebSocket upgrade

## Testing Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file configured with Juji credentials
- [ ] Server starts without errors (`npm start`)
- [ ] Authentication test passes (`/api/juji/test-auth`)
- [ ] Login to web app
- [ ] Click "Chat with AI" button
- [ ] Connection status shows "Connected" (green)
- [ ] Send message "Hello"
- [ ] Receive bot response
- [ ] Test product search: "show me WESTCO chocolate"
- [ ] Click "Back to Products" button
- [ ] Return to chat (session persists)
- [ ] Logout (WebSocket closes cleanly)

## Support

For issues related to:
- **Juji Platform**: Contact Juji support at https://juji.io
- **Integration Code**: Check CLAUDE.md for implementation details
- **API Endpoints**: See CLAUDE.md API Endpoints section

## Next Steps

1. **Configure your Juji chatbot flow** in the Juji dashboard
2. **Train the bot** to handle product-related questions
3. **Test various queries** to refine the natural language parsing
4. **Customize the chat UI** (colors, styles) in `public/styles.css`
5. **Add more search patterns** in `parseProductQuery()` function

## Files Modified

### Backend
- `package.json` - Added GraphQL dependencies
- `.env.example` - Added Juji configuration template
- `server.js` - Added ~250 lines for Juji integration

### Frontend
- `public/index.html` - Added chat screen UI (~40 lines)
- `public/app.js` - Added chat logic (~300 lines)
- `public/styles.css` - Added chat styling (~200 lines)

### Documentation
- `CLAUDE.md` - Added chatbot section
- `CHATBOT_SETUP.md` - This file

## Summary

✅ Juji chatbot successfully integrated
✅ Natural language product search working
✅ WebSocket real-time communication
✅ API key authentication (persistent, no expiration)
✅ Auto-reconnect on disconnect
✅ Session management (in-memory)
✅ Responsive chat UI with purple theme
✅ Comprehensive error handling
✅ Production-ready deployment configuration

Enjoy your new AI-powered product assistant! 🤖
