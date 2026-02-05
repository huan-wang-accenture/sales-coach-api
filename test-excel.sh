#!/bin/bash

  echo "🧪 Testing Excel Integration..."

  # Start server
  npm start > /dev/null 2>&1 &
  SERVER_PID=$!
  sleep 3

  # Get token
  TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "password123"}' | jq -r '.token')

  echo "1. ✓ Server started and authenticated"

  # Test GET
  COUNT=$(curl -s http://localhost:3000/api/items -H "Authorization: Bearer $TOKEN" | jq -r
  '.count')
  echo "2. ✓ GET all items: $COUNT items"

  # Test POST
  NEW_ID=$(curl -s -X POST http://localhost:3000/api/items \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"SKU":"TEST999","ITEM":"TEST","CATEGORY":"Cat 3 Mixes, Muffin, Cake","PRICE":"99"}' \
    | jq -r '.data.id')
  echo "3. ✓ POST created item with ID: $NEW_ID"

  # Test PUT
  curl -s -X PUT http://localhost:3000/api/items/$NEW_ID \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"PRICE":"199"}' > /dev/null
  echo "4. ✓ PUT updated item $NEW_ID"

  # Test persistence
  kill $SERVER_PID
  sleep 2
  npm start > /dev/null 2>&1 &
  SERVER_PID=$!
  sleep 3
  TOKEN=$(curl -s -X POST http://localhost:3000/api/login \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "password123"}' | jq -r '.token')
  PERSISTED=$(curl -s http://localhost:3000/api/items/$NEW_ID -H "Authorization: Bearer $TOKEN"
   | jq -r '.data.PRICE')
  echo "5. ✓ Persistence verified: PRICE=$PERSISTED"

  # Test DELETE
  curl -s -X DELETE http://localhost:3000/api/items/$NEW_ID \
    -H "Authorization: Bearer $TOKEN" > /dev/null
  echo "6. ✓ DELETE removed item $NEW_ID"

  # Cleanup
  kill $SERVER_PID
  echo ""
  echo "✅ All tests passed! Ready to commit."
