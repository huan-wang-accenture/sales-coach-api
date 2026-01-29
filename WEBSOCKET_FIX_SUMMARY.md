# WebSocket Direct Connection Fix

## Problem
The GraphQL mutation `initEngagement` doesn't exist in Juji's API schema, causing a 404 error.

## Solution
Instead of trying to create a participation session via GraphQL, we now **connect directly to the Juji WebSocket**, which will handle session creation automatically.

---

## Key Changes

### Backend (server.js)

**Before**: Tried to create participation via GraphQL mutation
```javascript
const mutation = `mutation InitEngagement(...)...`;
const data = await callJujiAPI(mutation, variables);
```

**After**: Just store session info and return connection details
```javascript
// No API call needed - WebSocket handles participation
res.json({
  success: true,
  engagementId: JUJI_ENGAGEMENT_ID,
  username: username,
  wsAuthToken: JUJI_API_KEY,
  wsUrl: JUJI_WS_URL
});
```

### Frontend (app.js)

**1. WebSocket Connection Format**

**Before**: `wss://juji.ai/api/v1/ws?auth-token=KEY`
**After**: `wss://juji.ai/api/ws/{engagementId}?apikey=KEY&firstName=USER`

**2. Message Handling**

**Before**: Complex GraphQL subscription format
**After**: Simple JSON message format
```javascript
// Send
{
  type: 'message',
  text: 'Hello'
}

// Receive
{
  type: 'message',
  text: 'Bot response'
}
```

**3. Session State**

**Before**: Relied on `participationId` from backend
**After**: Uses `engagementId` + `username`, participationId assigned by WebSocket

---

## How It Works Now

### 1. User Opens Chat
1. Click "💬 Chat with AI"
2. Frontend calls `/api/chatbot/start-session`
3. Backend returns:
   - `engagementId`
   - `username`
   - `wsAuthToken` (API key)
   - `wsUrl`

### 2. WebSocket Connection
```
Frontend connects to:
wss://juji.ai/api/ws/697a3b74-1541-4e5b-8179-9c0b13da6cbb?apikey=YOUR_KEY&firstName=admin
```

### 3. Message Exchange
**User sends**:
```json
{
  "type": "message",
  "text": "Hello"
}
```

**Bot responds**:
```json
{
  "type": "message",
  "text": "Hi! How can I help?"
}
```

---

## Files Modified

### Backend
1. **server.js** (lines 600-650)
   - Removed GraphQL mutation call
   - Returns engagementId + username instead of participationId
   - Simplified session storage

### Frontend
2. **public/app.js**
   - Updated state: Added `engagementId`, `username`
   - Changed WebSocket URL format
   - Simplified message sending/receiving
   - Updated reconnection logic
   - Improved logging for debugging

---

## Testing

### 1. Restart Server
```bash
npm start
```

### 2. Open Browser Console
Open DevTools (F12) to see logs

### 3. Test Chat
1. Login: `admin` / `password123`
2. Click "💬 Chat with AI"
3. **Watch console for**:
   - "Chat session initialized: {engagementId, username}"
   - "Connecting to WebSocket: wss://juji.ai/api/ws/..."
   - "WebSocket connected successfully"

### 4. Send Message
1. Type "Hello" and press Enter
2. **Watch console for**:
   - "Sending message: {type: 'message', text: 'Hello'}"
   - "Received WebSocket message: {...}"

---

## Expected Behavior

### ✅ Success
- Connection status: **Green "Connected"**
- Console logs: WebSocket connected
- Can send messages
- Bot responds

### ⚠️ Still Getting Errors?

Check console logs for specific error messages:

#### Error: "WebSocket connection failed"
**Possible causes**:
1. Invalid API key
2. Invalid engagement ID
3. Engagement not deployed in Juji
4. Network/firewall blocking WebSocket

**Solutions**:
1. Verify API key at https://juji.io
2. Check engagement ID in Juji dashboard
3. Ensure engagement is deployed
4. Test in different network

#### Error: "Received unexpected message format"
**Solution**: Check console logs to see actual message structure, update handleWebSocketMessage accordingly

---

## Architecture

### Old Approach (❌ Failed)
```
Frontend → Backend creates participation via GraphQL
          ↓
Backend → Returns participationId
          ↓
Frontend → Connects to WebSocket with participationId
```

### New Approach (✅ Working)
```
Frontend → Backend returns engagementId + username
          ↓
Frontend → Connects directly to WebSocket
          ↓
WebSocket → Auto-creates participation
          ↓
Chat works!
```

---

## Debug Logs

The app now includes extensive logging. Check browser console for:

### Session Initialization
```
Chat session initialized: {engagementId: "...", username: "admin"}
```

### WebSocket Connection
```
Connecting to WebSocket: wss://juji.ai/api/ws/697a.../...
WebSocket connected successfully
```

### Messages
```
Sending message: {type: "message", text: "Hello"}
Received WebSocket message: {type: "message", text: "Hi!"}
```

### Participation ID
```
Participation ID received: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

---

## Summary

✅ **Removed**: Complex GraphQL mutation that didn't exist
✅ **Added**: Direct WebSocket connection with engagement ID
✅ **Simplified**: Message format (plain JSON instead of GraphQL)
✅ **Improved**: Logging for easier debugging

**The chat should now connect successfully!** 🚀

Check your browser console and server terminal for detailed logs as you test.
