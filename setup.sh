#!/bin/bash

# Automatize - Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Automatize - Setup Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo "📦 Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 20+ from https://nodejs.org"
    exit 1      
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version is too old ($NODE_VERSION)${NC}"
    echo "Please upgrade to Node.js 20+"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo ""

# Check pnpm
echo "📦 Checking pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed${NC}"
    echo "Installing pnpm..."

    # Try to install without sudo first
    if npm install -g pnpm@8 --prefix ~/.npm-global 2>/dev/null; then
        export PATH=~/.npm-global/bin:$PATH
        echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc 2>/dev/null || echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
        echo -e "${GREEN}✅ pnpm installed successfully${NC}"
    else
        echo ""
        echo -e "${YELLOW}Please run: sudo npm install -g pnpm@8${NC}"
        echo "Or: npm install -g pnpm@8 --prefix ~/.npm-global"
        exit 1
    fi
else
    echo -e "${GREEN}✅ pnpm $(pnpm --version) detected${NC}"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
echo "This will take 2-5 minutes..."
pnpm install

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Build packages
echo "🔨 Building packages..."
pnpm build

echo -e "${GREEN}✅ Packages built successfully${NC}"
echo ""

# Run tests
echo "🧪 Running tests..."
pnpm test

echo -e "${GREEN}✅ Tests passed${NC}"
echo ""

# Success message
echo "================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "To start the mobile app:"
echo "  cd apps/mobile"
echo "  pnpm start"
echo ""
echo "Then:"
echo "  - Press 'i' for iOS simulator"
echo "  - Press 'a' for Android emulator"
echo "  - Press 'w' for web browser"
echo "  - Scan QR code with Expo Go app"
echo ""
echo "Documentation:"
echo "  - Quick Start: QUICK_START.md"
echo "  - Full Guide: GETTING_STARTED.md"
echo ""
echo "Happy coding! 🚀"
