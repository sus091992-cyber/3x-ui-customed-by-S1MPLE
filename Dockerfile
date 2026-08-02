# 1. Frontend Build
FROM node:22-alpine AS frontend-builder
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY internal/web/translation /src/internal/web/translation
RUN npm run build

# 2. Backend Build
FROM golang:1.26-alpine AS backend-builder
RUN apk add --no-cache git make gcc musl-dev sqlite-dev
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /src/internal/web/dist ./internal/web/dist
# Build x-ui binary
RUN CGO_ENABLED=1 go build -ldflags "-s -w" -o x-ui main.go

# 3. Final Runtime
FROM alpine:3.19
RUN apk add --no-cache curl bash ca-certificates socat tzdata sqlite nginx gettext \
    && ln -sf /usr/share/zoneinfo/Asia/Tehran /etc/localtime

WORKDIR /app
COPY --from=backend-builder /src/x-ui /usr/local/x-ui/x-ui
COPY --from=backend-builder /src/internal/web/translation /usr/local/x-ui/web/translation

# Copy nginx and start scripts
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh /usr/local/x-ui/x-ui

RUN mkdir -p /etc/x-ui /var/log/x-ui

EXPOSE $PORT
CMD ["/start.sh"]