# Official 3x-ui image
FROM ghcr.io/mhsanaei/3x-ui:latest

# Install nginx
RUN apk add --no-cache nginx gettext bash curl

# Copy nginx config and start script
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE $PORT
CMD ["/start.sh"]