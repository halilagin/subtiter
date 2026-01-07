# ============================================
# Stage 1: Builder - Install dependencies
# ============================================
FROM --platform=linux/arm64 python:3.12-slim AS builder

# Install build dependencies (will be discarded in final image)
RUN apt-get update && apt-get install -y --no-install-recommends \
    cmake \
    build-essential \
    libopenblas-dev \
    liblapack-dev \
    libx11-dev \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Copy pyproject.toml and install Python dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache .

# ============================================
# Stage 2: Final Runtime Image
# ============================================
FROM --platform=linux/arm64 python:3.12-slim

# Install only runtime dependencies (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    jq \
    curl \
    unzip \
    wget \
    xz-utils \
    fontconfig \
    fonts-dejavu \
    fonts-liberation \
    libopenblas0 \
    liblapack3 \
    libx11-6 \
    libgomp1 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Microsoft Core Fonts (Arial, etc.) - combine with cleanup
RUN echo "deb http://deb.debian.org/debian bookworm contrib" >> /etc/apt/sources.list && \
    apt-get update && \
    echo "ttf-mscorefonts-installer msttcorefonts/accepted-mscorefonts-eula select true" | debconf-set-selections && \
    apt-get install -y --no-install-recommends ttf-mscorefonts-installer && \
    fc-cache -f -v && \
    apt-get purge -y --auto-remove && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /var/cache/fontconfig/*

# Install FFmpeg static build (optimized for ARM64) and cleanup in same layer
RUN wget -q https://johnvansickle.com/ffmpeg/builds/ffmpeg-git-arm64-static.tar.xz && \
    tar xf ffmpeg-git-arm64-static.tar.xz && \
    cd ffmpeg-git-*-arm64-static && \
    mv ffmpeg ffprobe /usr/local/bin/ && \
    cd .. && \
    rm -rf ffmpeg-git-*-arm64-static* && \
    strip /usr/local/bin/ffmpeg /usr/local/bin/ffprobe 2>/dev/null || true

# Install AWS CLI v2 and cleanup in same layer
RUN curl -s "https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip" -o "awscliv2.zip" && \
    unzip -q awscliv2.zip && \
    ./aws/install --bin-dir /usr/local/bin --install-dir /usr/local/aws-cli && \
    rm -rf awscliv2.zip aws /usr/local/aws-cli/v2/*/dist/aws_completer \
           /usr/local/aws-cli/v2/*/dist/awscli/data/ac.index \
           /usr/local/aws-cli/v2/*/dist/awscli/examples

# Copy Python packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Set working directory
WORKDIR /app

# Copy application code
COPY . .
COPY .env.fargate .env

# Make entrypoint scripts executable
RUN chmod +x /app/entrypoint.sh \
    /app/entrypoint_genshorts_wholistic.sh \
    /app/entrypoint_genshorts_parent.sh \
    /app/entrypoint_genshorts_child.sh \
    /app/entrypoint_genshorts.sh \
    /app/entrypoint_subtitling.sh

# Clean up any unnecessary files
RUN find /usr/local/lib/python3.12/site-packages -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.12/site-packages -type d -name "test" -exec rm -rf {} + 2>/dev/null || true && \
    find /usr/local/lib/python3.12/site-packages -name "*.pyc" -delete && \
    find /usr/local/lib/python3.12/site-packages -name "*.pyo" -delete && \
    find /usr/local/lib/python3.12/site-packages -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true && \
    rm -rf /root/.cache /tmp/* /var/tmp/*

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

