FROM node:18-alpine

# Install PM2 globally
RUN npm install pm2 -g

# Install Puppeteer dependencies
RUN apk update && apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    nodejs \
    yarn

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser


# Create app directory
WORKDIR /app

# Copy ecosystem file first (explicit)
COPY ecosystem.config.js .

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Now copy everything else
COPY . .

# Create a directory for keys and chrome user data
RUN mkdir -p keys \
    && mkdir -p /tmp/chrome-user-data

# Add user for running Chrome and set permissions
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app \
    && chown -R pptruser:pptruser /tmp/chrome-user-data

# Add additional Chrome flags to environment
ENV PUPPETEER_ARGS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-setuid-sandbox --single-process"

# Run as non-root user
USER pptruser

# Create a directory for keys
RUN mkdir -p keys

# Start command
CMD ["pm2-runtime", "ecosystem.config.js"]
