# Use an official Tauri build image or a well-maintained community one
# This example uses a common image that includes Rust, Node.js, and Linux build essentials.
# Check for the latest or most suitable image for your needs.
FROM ghcr.io/tauri-apps/tauri-build:latest

# Set the working directory inside the container
WORKDIR /app

# Copy only necessary files for dependency caching first
# Copy Cargo.toml and Cargo.lock for Rust dependencies
COPY src-tauri/Cargo.toml src-tauri/Cargo.lock ./src-tauri/
# Copy package.json and lock file for Node.js dependencies (if your build hooks need them)
COPY package.json package-lock.json ./

# Install Rust dependencies (this layer will be cached if Cargo files don't change)
# Note: This step might be redundant if the base image already handles Rust setup well,
# but it's good practice for ensuring dependencies are fetched.
# We'll build the actual application later.
# This step is primarily for caching the dependency download phase.
RUN cd src-tauri && \
    mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release --locked && \
    rm -rf src target

# Install Node.js dependencies (if your build hooks or frontend build needs them inside Docker)
# If your frontend is pre-built, you might skip or adjust this.
# RUN npm install --legacy-peer-deps

# Copy the rest of your application source code
COPY . .

# Ensure your frontend is built. If you build it outside Docker (recommended),
# ensure the distDir (e.g., ./dist or ./frontend/dist) is copied correctly.
# If you need to build the frontend inside Docker, uncomment and adjust:
# RUN npm run build

# Run the Tauri build command for Linux targets
# This will produce .deb and .AppImage by default if "targets": "all" or relevant Linux targets are specified.
RUN cd src-tauri && \
    cargo tauri build --verbose

# The CMD is not strictly necessary if you're just using the container to build
# and then copying artifacts out. But it can be useful for debugging.
CMD ["echo", "Tauri Linux build complete. Artifacts are in /app/src-tauri/target/release/bundle/"]
