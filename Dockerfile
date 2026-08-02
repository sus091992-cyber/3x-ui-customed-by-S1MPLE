# ========================================================
# Stage: Frontend
# ========================================================
FROM node:22-alpine AS frontend
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY internal/web/translation /src/internal/web/translation
RUN npm run build

# ========================================================
# Stage: Builder
# ========================================================
FROM golang:1.26-alpine AS builder
WORKDIR /app
RUN apk add --no-cache build-base gcc curl unzip
COPY . .
COPY --from=frontend /src/internal/web/dist ./internal/web/dist
RUN CGO_ENABLED=1 go build -ldflags "-w -s" -o build/x-ui main.go

# ========================================================
# Stage: Final
# ========================================================
FROM alpine:3.19
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata fail2ban bash curl openssl nginx gettext \
    && ln -sf /usr/share/zoneinfo/Asia/Tehran /etc/localtime

COPY --from=builder /app/build/x-ui /usr/local/x-ui/x-ui
COPY --from=builder /app/internal/web/translation /usr/local/x-ui/web/translation

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh /usr/local/x-ui/x-ui

RUN mkdir -p /etc/x-ui /var/log/x-ui

EXPOSE $PORT
CMD ["/start.sh"]
