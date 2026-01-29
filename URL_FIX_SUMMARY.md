# Juji URL Fix - Using /chat Instead of /api

## Problem
The WebSocket was trying to connect to `wss://juji.ai/api/ws/{engagementId}` which doesn't exist.

## Solution
Since `https://juji.ai/chat/{engagementId}` works, we should use:
- **WebSocket**: `wss://juji.ai/chat/{engagementId}`

---

## Changes Made

### 1. Environment Variables (.env)

**Before**:
```env
JUJI_API_URL=https://juji.ai/api
JUJI_WS_URL=wss://juji.ai/api/ws
```

**After**:
```env
JUJI_API_URL=https://juji.ai/chat
JUJI_WS_URL=wss://juji.ai/chat
```

### 2. Frontend WebSocket Connection

**Before**:
```javascript
const url = `wss://juji.ai/api/ws/${engId}?apikey=${apiKey}&firstName=${user}`;
```

**After**:
```javascript
const url = `wss://juji.ai/chat/${engId}`;
```

**Simplified**: No query parameters needed, just like the HTTP URL!

---

## Testing

### 1. Stop Current Server
```bash
# Press Ctrl+C in the terminal running the server
```

### 2. Restart Server
```bash
npm start
```

### 3. Test in Browser
1. **Refresh browser page** (important!)
2. Login: `admin` / `password123`
3. **Open DevTools Console (F12)**
4. Click "💬 Chat with AI"

### 4. Check Console Logs

**Should see**:
```
Chat session initialized: {engagementId: "697a...", username: "admin"}
Connecting to WebSocket: wss://juji.ai/chat/697a3b74-1541-4e5b-8179-9c0b13da6cbb
Engagement ID: 697a3b74-1541-4e5b-8179-9c0b13da6cbb
User: admin
WebSocket connected successfully
```

**Connection status should turn GREEN**: "Connected"

---

## WebSocket URL Format

### ✅ Correct (Now)
```
wss://juji.ai/chat/697a3b74-1541-4e5b-8179-9c0b13da6cbb
```

### ❌ Incorrect (Before)
```
wss://juji.ai/api/ws/697a3b74-1541-4e5b-8179-9c0b13da6cbb
```

The correct URL mirrors the working HTTP URL:
- HTTP: `https://juji.ai/chat/{engagementId}` ✅
- WebSocket: `wss://juji.ai/chat/{engagementId}` ✅

---

## What Changed

### Files Modified
1. `.env` - Updated URLs
2. `.env.example` - Updated URLs
3. `public/app.js` - Simplified WebSocket connection

### Key Improvements
- ✅ Using correct `/chat` path
- ✅ Removed unnecessary query parameters
- ✅ Simplified connection logic
- ✅ Better logging for debugging

---

## If Still Getting Errors

### Check Browser Console
Press F12 and look for:
- "WebSocket connected successfully" ✅
- "WebSocket connection to 'wss://juji.ai/chat/...' failed:" ❌

### Possible Issues

#### 1. WebSocket Protocol Error
If you see CORS or protocol errors, the WebSocket endpoint might require authentication headers (which WebSocket doesn't support).

**Solution**: We might need to use Juji's iframe embed instead of direct WebSocket.

#### 2. 404 Not Found
The engagement might not be accessible via WebSocket.

**Check**: Can you access https://juji.ai/chat/697a3b74-1541-4e5b-8179-9c0b13da6cbb in your browser? (without being logged in)

#### 3. Authentication Required
The WebSocket might require the API key in a different format.

**Try**: We can add the API key back as a query parameter or header.

---

## Next Steps

1. **Restart server** - `npm start`
2. **Refresh browser** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. **Open console** - F12 to see detailed logs
4. **Test chat** - Click "💬 Chat with AI"
5. **Check logs** - Look for "WebSocket connected successfully"

If you still see errors, **copy the exact error message from the browser console** and we can troubleshoot further!

---

## Summary

✅ **Changed**: URLs from `/api/ws` to `/chat`
✅ **Simplified**: WebSocket connection (no query params)
✅ **Aligned**: With working HTTP URL pattern
✅ **Ready**: Restart server and test!

The WebSocket URL now matches the working HTTP URL pattern. This should connect successfully! 🚀
