#!/bin/bash

# Script to properly restart the Docker container with Ray fixes

echo "🛑 Stopping existing containers..."
docker compose down

echo "🧹 Cleaning up old Ray state..."
rm -rf /tmp/ray 2>/dev/null || true

echo "🔨 Rebuilding and starting containers..."
docker compose up --build -d

echo "⏳ Waiting for container to start..."
sleep 5

echo "📋 Checking container status..."
docker compose ps

echo ""
echo "📊 Container logs (Ctrl+C to exit):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker compose logs -f

