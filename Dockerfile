#!/bin/bash

# Build stage - compile Go + build frontend
FROM node:22-alpine AS frontend-builder
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
COPY internal/web/translation /src/internal/web/translation
RUN npm run build

FROM golang:1.26-alpine AS backend-builder
RUN apk add --no-cache git make gcc musl-dev sqlite-dev
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /src/internal/web/dist ./internal/web/dist
RUN CGO_ENABLED=1 go build -ldflags "-s -w" -o x-ui main.go

# Runtime stage
FROM alpine:3.19
RUN apk add --no-cache curl bash ca-certificates socat tzdata sqlite nginx gettext \
    && ln -sf /usr/share/zoneinfo/Asia/Tehran /etc/localtime

WORKDIR /app
COPY --from=backend-builder /src/x-ui /app/x-ui
COPY --from=backend-builder /src/internal/web/translation /app/internal/web/translation

# Copy nginx and start scripts
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh /app/x-ui

RUN mkdir -p /etc/x-ui /var/log/x-ui

EXPOSE $PORT
CMD ["/app/start.sh"]