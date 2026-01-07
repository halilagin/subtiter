#!/bin/sh

# Create necessary directories
mkdir -p /var/www/certbot

# Start Nginx with HTTP-only configuration
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for Nginx to start
sleep 5

# Initial certificate request
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    certbot certonly --webroot \
        -w /var/www/certbot \
        --email ${EMAIL} \
        -d ${DOMAIN} \
        --rsa-key-size 4096 \
        --agree-tos \
        --force-renewal \
        --non-interactive
    
    # If certificates were obtained successfully, update Nginx configuration
    if [ -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
        # Copy the SSL configuration
        cp /etc/nginx/nginx.conf.ssl /etc/nginx/nginx.conf
        # Reload Nginx
        nginx -s reload
    fi
fi

# Keep the script running and renew certificates every 12 hours
while :; do
    sleep 12h
    certbot renew
    if [ $? -eq 0 ]; then
        nginx -s reload
    fi
done 