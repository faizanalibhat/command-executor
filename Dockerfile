FROM node:18-alpine

# Install PM2 globally
RUN npm install pm2 -g

RUN apk add --no-cache python3 make g++ curl

# Install Go (required for nuclei)
RUN apk add --no-cache go git

# Install nuclei
RUN go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest && \
    ln -s /root/go/bin/nuclei /usr/local/bin/nuclei


# Install nmap
RUN apk add --no-cache nmap

# Install subfinder instead of nuclei
RUN go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest && \
    ln -s /root/go/bin/subfinder /usr/local/bin/subfinder

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

# Add additional Chrome flags to environment - modified for root user
ENV PUPPETEER_ARGS="--no-sandbox --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --disable-setuid-sandbox --disable-singleton-lock"

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

# Create pptruser but we won't switch to it
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser

# Create a directory for keys
RUN mkdir -p keys

# Add this to your Dockerfile
RUN echo "#!/bin/sh\nrm -rf /tmp/chrome-user-data/*\nexec \"\$@\"" > /entrypoint.sh && \
    chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Start command - running as root
CMD ["pm2-runtime", "ecosystem.config.js"]