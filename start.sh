#!/bin/bash
set -e

echo "🚀 Starting S1MPLE PANEL + nginx reverse proxy..."

# Railway port ro az env var $PORT mide
export NGINX_PORT=${PORT:-3000}

echo "🔧 Building nginx.conf for port: $NGINX_PORT"
envsubst '${NGINX_PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "▶️  Starting x-ui in background..."
./x-ui &
X_UI_PID=$!

sleep 3

echo "▶️  Starting nginx in foreground on port $NGINX_PORT..."
nginx -t
exec nginx -g "daemon off;"