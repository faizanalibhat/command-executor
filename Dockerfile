FROM node:18-bullseye

# Install PM2 globally
RUN npm install -g pm2

# Install build dependencies and core tools
RUN apt-get update && \
    apt-get install -y \
        python3 \
        make \
        g++ \
        curl \
        git \
        nmap \
        wget \
        gnupg \
        ca-certificates \
        fonts-freefont-ttf \
        libnss3 \
        libatk-bridge2.0-0 \
        libatk1.0-0 \
        libcups2 \
        libdrm2 \
        libxkbcommon0 \
        libxcomposite1 \
        libxdamage1 \
        libxrandr2 \
        libgbm1 \
        libasound2 \
        libxshmfence1 \
        xdg-utils \
        libpangocairo-1.0-0 \
        libpangoft2-1.0-0 \
        libharfbuzz0b \
        libfreetype6 \
        libappindicator3-1 \
        libx11-xcb1 \
        libxss1 \
        chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Go manually (v1.24.3 as of now)
ENV GOLANG_VERSION=1.24.3

RUN curl -LO https://go.dev/dl/go${GOLANG_VERSION}.linux-amd64.tar.gz && \
    rm -rf /usr/local/go && \
    tar -C /usr/local -xzf go${GOLANG_VERSION}.linux-amd64.tar.gz && \
    rm go${GOLANG_VERSION}.linux-amd64.tar.gz

ENV PATH="/usr/local/go/bin:$PATH"

# Install nuclei and subfinder
RUN go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest && \
    go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    ln -s /root/go/bin/nuclei /usr/local/bin/nuclei && \
    ln -s /root/go/bin/subfinder /usr/local/bin/subfinder

# Puppeteer config
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_ARGS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-setuid-sandbox --disable-singleton-lock" \
    CHROMIUM_BIN=/usr/bin/chromium \
    CHROMIUM_DATA_DIR=/tmp/chrome-user-data \
    CHROMIUM_ARGS="--headless --no-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-setuid-sandbox --disable-singleton-lock"

# Create app directory
WORKDIR /app

# Copy necessary files first for better Docker caching
COPY ecosystem.config.js .
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy remaining app files
COPY . .

# Prepare directories
RUN mkdir -p keys /tmp/chrome-user-data && \
    chmod 777 /tmp/chrome-user-data && \
    addgroup --system pptruser && \
    adduser --system --ingroup pptruser pptruser && \
    mkdir -p /home/pptruser/Downloads && \
    chown -R pptruser:pptruser /home/pptruser

# Start command
CMD ["pm2-runtime", "ecosystem.config.js"]