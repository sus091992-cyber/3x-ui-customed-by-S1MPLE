# Build stage - compile Go + build frontend
FROM golang:1.26-alpine AS builder

RUN apk add --no-cache \
    git \
    make \
    gcc \
    musl-dev \
    sqlite-dev \
    nodejs \
    npm

WORKDIR /src

# Copy go mod files first for caching
COPY go.mod go.sum ./
RUN go mod download

# Copy source
COPY . .

# Build frontend first
WORKDIR /src/frontend
RUN npm ci && npm run build

# Build Go binary
WORKDIR /src
RUN make build

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache \
    curl \
    bash \
    ca-certificates \
    socat \
    tzdata \
    sqlite \
    nginx \
    gettext \
    && ln -sf /usr/share/zoneinfo/Asia/Tehran /etc/localtime

# Copy binary from builder
COPY --from=builder /src/x-ui /usr/local/x-ui/x-ui
COPY --from=builder /src/internal/web/dist /usr/local/x-ui/web/dist
COPY --from=builder /src/internal/web/translation /usr/local/x-ui/web/translation

RUN mkdir -p /etc/x-ui /var/log/x-ui

COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY start.sh /start.sh
RUN chmod +x /start.sh /usr/local/x-ui/x-ui

EXPOSE $PORT

CMD ["/start.sh"]