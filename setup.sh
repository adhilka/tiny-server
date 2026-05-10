#!/bin/bash

# OmniServer: The Universal Local Server for AI & Web Hosting
# This script installs and configures OmniServer on your device (Android/Linux).

set -e

echo "=========================================="
echo "   🚀 OMNISERVER INSTALLATION STARTING   "
echo "=========================================="

# Check for environment
if command -v pkg &> /dev/null; then
    # Termux environment
    PM="pkg"
    echo "Detected: Mobile (Termux)"
elif command -v apt-get &> /dev/null; then
    # Debian/Ubuntu environment
    PM="apt-get"
    echo "Detected: Linux (Debian/Ubuntu)"
else
    echo "❌ Unsupported environment. Please install Node.js and Git manually."
    exit 1
fi

echo "📦 1/4 Updating System Packages..."
$PM update -y && $PM upgrade -y

echo "🔧 2/4 Installing Prerequisites (Node.js, Git, Curl)..."
$PM install nodejs git curl -y

echo "🤖 3/4 Verifying AI Engine (Ollama)..."
if ! command -v ollama &> /dev/null; then
    echo "⚠️ Ollama not detected."
    if [ "$PM" == "pkg" ]; then
        echo "   Please install Ollama for Android if available, or install it on a networked PC."
    else
        echo "   Installing Ollama automatically..."
        curl -fsSL https://ollama.com/install.sh | sh
    fi
else
    echo "✅ Ollama is ready."
fi

echo "📂 4/4 Cloning & Configuring OmniServer..."
if [ -d "omniserver" ]; then
    echo "   Existing 'omniserver' directory found. Entering..."
    cd omniserver
    git pull
else
    git clone https://github.com/adhilka/tiny-server.git omniserver
    cd omniserver
fi

echo "⚡ Installing App Dependencies..."
npm install

echo "🌍 Preparing Hosting Directory..."
mkdir -p uploads

echo "=========================================="
echo "   ✅ OMNISERVER SETUP COMPLETE!         "
echo "=========================================="
echo "
HOW TO START:
1. Start AI Engine:
   ollama serve

2. Start OmniServer (this app):
   npm run dev

FEATURES ACTIVE:
- Local Terminal Control
- Local AI Model Management
- File Sharing & Web Hosting (/src/public)
- Mobile-Optimized Dashboard

ACCESS:
Open http://localhost:3000 on this device.
Use this device IP address to access from other devices on your Wi-Fi.
"
