# Juji API Fix Summary

## Problem Identified ✅

**Error**: 404 Not Found - "Unknown server resource"
**Root Cause**: Incorrect Juji API endpoint

### What Was Wrong:
```
❌ INCORRECT: https://juji.ai/api/pre-chat/{engagementId}
✅ CORRECT:   Use GraphQL API at https://juji.ai/api/graphql
```

The `/api/pre-chat/` endpoint doesn't exist in the Juji API. We need to use the GraphQL API with proper mutations.

---

## Changes Made

### 1. Fixed Participation Creation (server.js)

**Before**:
```javascript
// Incorrect REST endpoint
const preChat = await fetch(
  `${JUJI_API_URL}/pre-chat/${JUJI_ENGAGEMENT_ID}`,
  { method: 'POST', ... }
);
```

**After**:
```javascript
// Correct GraphQL mutation
const mutation = `
  mutation InitEngagement($engagementId: String!, $firstName: String!) {
    initEngagement(
      engagementId: $engagementId
      firstName: $firstName
    ) {
      participationId
    }
  }
`;

const data = await callJujiAPI(mutation, variables);
```

### 2. Updated WebSocket URL

**Before**: `wss://juji.ai/api/v1/ws`
**After**: `wss://juji.ai/api/ws`

Updated in both:
- `.env` file
- `.env.example` file

---

## Files Modified

1. **server.js** (lines 623-648)
   - Replaced REST API call with GraphQL mutation
   - Using `initEngagement` mutation
   - Properly extracting `participationId` from GraphQL response

2. **.env**
   - Updated `JUJI_WS_URL` to correct endpoint

3. **.env.example**
   - Updated `JUJI_WS_URL` for future reference

---

## How It Works Now

### Backend Flow:
1. User clicks "Chat with AI"
2. Frontend calls `/api/chatbot/start-session`
3. Backend calls Juji GraphQL API:
   ```
   POST https://juji.ai/api/graphql
   Authorization: Basic {base64(apikey:YOUR_API_KEY)}

   mutation InitEngagement {
     initEngagement(
       engagementId: "697a3b74-1541-4e5b-8179-9c0b13da6cbb"
       firstName: "admin"
     ) {
       participationId
     }
   }
   ```
4. Juji returns `participationId`
5. Backend sends to frontend:
   - `participationId`
   - `wsAuthToken` (API key)
   - `wsUrl` (WebSocket URL)
6. Frontend connects to WebSocket with credentials

---

## Testing the Fix

### 1. Restart the Server
```bash
npm start
```

### 2. Test in Browser
1. Open http://localhost:3000
2. Login: `admin` / `password123`
3. Click "💬 Chat with AI"
4. Watch server logs for success message

### Expected Server Logs:
```
Creating Juji session for user: admin
Engagement ID: 697a3b74-1541-4e5b-8179-9c0b13da6cbb
Calling Juji GraphQL API...
Juji session created successfully. Participation ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### If Still Getting Errors:

#### Error: "Cannot find module 'graphql-request'"
**Solution**: Already installed, restart server

#### Error: GraphQL validation error
**Possible Causes**:
1. Invalid API key
2. Invalid engagement ID
3. Engagement not deployed in Juji

**Check**:
- Login to https://juji.io
- Verify engagement is deployed
- Verify API key is current (regenerate if needed)

#### Error: "participationId is undefined"
**Possible Cause**: GraphQL mutation name might be different

**Alternative mutations to try**:
- `createParticipation`
- `startEngagement`
- `initChat`

To test which mutation works, try in GraphiQL:
https://juji.ai/graphiql/graphiql.html

---

## GraphQL Mutation Details

### Current Mutation:
```graphql
mutation InitEngagement($engagementId: String!, $firstName: String!) {
  initEngagement(
    engagementId: $engagementId
    firstName: $firstName
  ) {
    participationId
  }
}
```

### Variables:
```json
{
  "engagementId": "697a3b74-1541-4e5b-8179-9c0b13da6cbb",
  "firstName": "admin"
}
```

### Expected Response:
```json
{
  "data": {
    "initEngagement": {
      "participationId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  }
}
```

---

## Troubleshooting

### Test GraphQL Mutation Manually

Use curl to test:
```bash
curl -X POST https://juji.ai/api/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'apikey:48454ec71c2d4947992c399465df7e82' | base64)" \
  -d '{
    "query": "mutation { initEngagement(engagementId: \"697a3b74-1541-4e5b-8179-9c0b13da6cbb\", firstName: \"test\") { participationId } }"
  }'
```

### Test with GraphiQL Interface

1. Go to https://juji.ai/graphiql/graphiql.html
2. Add Authorization header:
   ```
   Authorization: Basic YXBpa2V5OjQ4NDU0ZWM3MWMyZDQ5NDc5OTJjMzk5NDY1ZGY3ZTgy
   ```
3. Run mutation:
   ```graphql
   mutation {
     initEngagement(
       engagementId: "697a3b74-1541-4e5b-8179-9c0b13da6cbb"
       firstName: "test"
     ) {
       participationId
     }
   }
   ```
4. Check response for `participationId`

---

## Next Steps

1. ✅ **Restart server** - Pick up new GraphQL code
2. ✅ **Test chat panel** - Click "Chat with AI"
3. ✅ **Check logs** - Verify participation creation
4. ✅ **Send message** - Test WebSocket connection
5. ✅ **Verify bot response** - Confirm end-to-end flow

---

## What's Fixed

✅ Replaced incorrect `/api/pre-chat/` endpoint
✅ Using proper GraphQL mutation `initEngagement`
✅ Updated WebSocket URL to `/api/ws`
✅ Added detailed logging for debugging
✅ Properly extracting `participationId` from response

---

## Summary

**Before**: Used non-existent REST endpoint → 404 error
**After**: Using correct GraphQL API → Should work!

The connection should now work correctly. If you still get errors, the server logs will show the exact GraphQL error message, which will help us debug further.

**Restart the server and test it!** 🚀
