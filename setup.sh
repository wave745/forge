#!/bin/bash

# FORGE Setup Script
# This script ensures all dependencies are installed and configured correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Display FORGE logo
display_logo() {
    echo -e "${BLUE}"
    cat << 'EOF_LOGO'
        ███████╗░█████╔╗░██████╗░░██████╗░███████╗
        ██╔════╝██╔══██╗██╔══██╗██╔════╝░██╔════╝
        █████╗░░██║░░██║██████╔╝██║░░██╗░█████╗░░
        ██╔══╝░░██║░░██║██╔══██╗██║░░╚██╗██╔══╝░░
        ██║░░░░░╚█████╔╝██║░░██║╚██████╔╝███████╗
        ╚═╝░░░░░░╚════╝░╚═╝░░╚═╝░╚═════╝░╚══════╝
EOF_LOGO
    echo -e "${NC}"
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC} ${YELLOW}FORGE${NC} - Solana Development Platform${GREEN}                       ║${NC}"
    echo -e "${GREEN}║${NC} Build, deploy, and manage Solana programs with AI${GREEN}         ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
check_nodejs() {
    log_info "Checking Node.js installation..."
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install Node.js 18+ first."
        log_info "Visit: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node --version | sed 's/v//')
    REQUIRED_VERSION="18.0.0"

    if ! [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$REQUIRED_VERSION" ]; then
        log_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+"
        exit 1
    fi

    log_success "Node.js $NODE_VERSION is installed"
}

# Check npm
check_npm() {
    log_info "Checking npm installation..."
    if ! command_exists npm; then
        log_error "npm is not installed"
        exit 1
    fi

    NPM_VERSION=$(npm --version)
    log_success "npm $NPM_VERSION is installed"
}

# Check Rust
check_rust() {
    log_info "Checking Rust installation..."
    if ! command_exists rustc; then
        log_error "Rust is not installed. Installing Rust..."
        curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
        source ~/.cargo/env
    fi

    RUST_VERSION=$(rustc --version | cut -d' ' -f2)
    log_success "Rust $RUST_VERSION is installed"

    # Update Rust to latest
    log_info "Updating Rust toolchain..."
    rustup update
}

# Check Anchor CLI
check_anchor() {
    log_info "Checking Anchor CLI installation..."
    if ! command_exists anchor; then
        log_warning "Anchor CLI not found. Installing..."
        cargo install --git https://github.com/coral-xyz/anchor anchor-cli --tag v0.29.0
    fi

    ANCHOR_VERSION=$(anchor --version 2>/dev/null || echo "unknown")
    log_success "Anchor CLI is installed"
}

# Check Solana CLI
check_solana() {
    log_info "Checking Solana CLI installation..."
    if ! command_exists solana; then
        log_warning "Solana CLI not found. Installing..."
        sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
        export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
    fi

    SOLANA_VERSION=$(solana --version 2>/dev/null | head -n1 | cut -d' ' -f2 || echo "unknown")
    log_success "Solana CLI is installed"
}

# Install Node.js dependencies
install_dependencies() {
    log_info "Installing Node.js dependencies..."

    # Install root dependencies
    npm install

    # Install CLI dependencies
    log_info "Installing CLI dependencies..."
    cd packages/cli
    npm install
    npm run build
    npm link
    cd ../..

    # Install SDK dependencies
    log_info "Installing SDK dependencies..."
    cd packages/sdk
    npm install
    npm run build
    cd ../..

    # Install backend dependencies
    log_info "Installing backend dependencies..."
    cd packages/backend
    npm install
    npm run build
    cd ../..

    log_success "All dependencies installed"
}

# Setup environment files
setup_environment() {
    log_info "Setting up environment files..."

    # Root .env.local
    if [ ! -f ".env.local" ]; then
        cat > .env.local << EOF_ENV
# FORGE Environment Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
EOF_ENV
        log_success "Created .env.local"
    else
        log_warning ".env.local already exists"
    fi

    # Backend .env.local
    if [ ! -f "packages/backend/.env.local" ]; then
        cat > packages/backend/.env.local << EOF_ENV
# Backend Environment Configuration
TREASURY_PUBKEY=11111111111111111111111111111112
HELIUS_RPC_URL=https://api.devnet.solana.com
PORT=3001
NODE_ENV=development
EOF_ENV
        log_success "Created packages/backend/.env.local"
    else
        log_warning "packages/backend/.env.local already exists"
    fi
}

# Test installation
test_installation() {
    log_info "Testing installation..."

    # Test CLI
    if command_exists forge; then
        FORGE_VERSION=$(forge --version)
        log_success "FORGE CLI $FORGE_VERSION is working"
    else
        log_error "FORGE CLI not found in PATH"
        exit 1
    fi

    # Test Anchor
    if anchor --version >/dev/null 2>&1; then
        log_success "Anchor CLI is working"
    else
        log_warning "Anchor CLI test failed - may need PATH update"
    fi

    # Test Solana
    if solana --version >/dev/null 2>&1; then
        log_success "Solana CLI is working"
    else
        log_warning "Solana CLI test failed - may need PATH update"
    fi
}

# Main setup function
main() {
    display_logo
    log_info "Starting FORGE Development Environment Setup"

    check_nodejs
    check_npm
    check_rust
    check_anchor
    check_solana
    install_dependencies
    setup_environment
    test_installation

    echo ""
    echo -e "${GREEN}🎉 FORGE setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Start the website: npm run dev"
    echo "2. Create a project: forge init my-project"
    echo "3. Build programs: cd my-project && forge build"
    echo ""
    echo -e "${BLUE}For more information, see:${NC}"
    echo "- docs/guides/getting-started.md"
    echo "- docs/README.md"
}

# Run main function
main "$@"
