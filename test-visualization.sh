#!/bin/bash

# Test script for the visualization endpoint
# Usage: ./test-visualization.sh

set -e

echo "🧪 Testing Visualization Endpoint"
echo "=================================="
echo ""

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
USERNAME="${USERNAME:-admin}"
PASSWORD="${PASSWORD:-password123}"

# Step 1: Login
echo "Step 1: Logging in..."
TOKEN=$(curl -s -X POST "$API_URL/api/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  exit 1
fi

echo "✅ Login successful"
echo ""

# Test 1: Visualize WESTCO products
echo "Test 1: WESTCO products (price: $100-$300)"
echo "-------------------------------------------"
curl -s -X POST "$API_URL/api/items/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand": "WESTCO", "minPrice": 100, "maxPrice": 300}' | \
jq '{data: .data}' | \
curl -X POST "$API_URL/api/items/visualize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output westco-visualization.png

if [ -f westco-visualization.png ]; then
  SIZE=$(du -h westco-visualization.png | cut -f1)
  echo "✅ Generated: westco-visualization.png ($SIZE)"
else
  echo "❌ Failed to generate westco-visualization.png"
fi
echo ""

# Test 2: Visualize chocolate products
echo "Test 2: Chocolate products"
echo "-------------------------"
curl -s -X POST "$API_URL/api/items/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "chocolate"}' | \
jq '{data: .data}' | \
curl -X POST "$API_URL/api/items/visualize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output chocolate-visualization.png

if [ -f chocolate-visualization.png ]; then
  SIZE=$(du -h chocolate-visualization.png | cut -f1)
  echo "✅ Generated: chocolate-visualization.png ($SIZE)"
else
  echo "❌ Failed to generate chocolate-visualization.png"
fi
echo ""

# Test 3: Visualize all brownie products
echo "Test 3: Brownie products"
echo "-----------------------"
curl -s -X POST "$API_URL/api/items/filter" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"category": "brownie"}' | \
jq '{data: .data}' | \
curl -X POST "$API_URL/api/items/visualize" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @- \
  --output brownie-visualization.png

if [ -f brownie-visualization.png ]; then
  SIZE=$(du -h brownie-visualization.png | cut -f1)
  echo "✅ Generated: brownie-visualization.png ($SIZE)"
else
  echo "❌ Failed to generate brownie-visualization.png"
fi
echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo "Generated visualizations:"
ls -lh *-visualization.png 2>/dev/null | awk '{print "  -", $9, "(" $5 ")"}'
echo ""
echo "To view images:"
echo "  Mac:     open *-visualization.png"
echo "  Linux:   xdg-open *-visualization.png"
echo "  Windows: start *-visualization.png"
