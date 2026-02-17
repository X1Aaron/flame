#!/bin/bash
# Script to restart Flame with the updated Docker image

echo "Stopping and removing old container..."
docker stop flame 2>/dev/null
docker rm flame 2>/dev/null

echo "Starting new container with updated image..."
docker run -d \
  -p 5005:5005 \
  -v "$(pwd)/data:/app/data" \
  -e PASSWORD=your_password \
  --name flame \
  flame:modern-frontend

echo ""
echo "✅ Flame is now running with the updated frontend!"
echo "🌐 Access it at: http://localhost:5005"
echo ""
echo "To view logs: docker logs -f flame"
echo "To stop: docker stop flame"
