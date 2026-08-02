# Use official 3x-ui image as base
FROM ghcr.io/mhsanaei/3x-ui:latest

# Install nginx for reverse proxy
RUN apk add --no-cache nginx gettext bash curl

# Copy our custom nginx config and start script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Expose Railway port
EXPOSE $PORT

# Use our start script instead of default
CMD ["/start.sh"]