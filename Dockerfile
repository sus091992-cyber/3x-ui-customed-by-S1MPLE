# Official 3x-ui image - use it directly
FROM ghcr.io/mhsanaei/3x-ui:latest

# Set default port for Railway
ENV PORT=2053
ENV XUI_DB_TYPE=sqlite
ENV XUI_DB_DSN=/etc/x-ui/x-ui.db
ENV XUI_ENABLE_FAIL2BAN=true

EXPOSE 2053