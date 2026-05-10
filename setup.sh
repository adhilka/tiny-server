#!/bin/bash

# OmniServer Setup Script
# Use this to install the system on your device (Linux/Termux)

echo "--- OmniServer Installation ---"

# Detect package manager
if command -v pkg &> /dev/null; then
    PM="pkg"
elif command -v apt-get &> /dev/null; then
    PM="apt-get"
else
    echo "Unsupported device. Please install Node.js and Ollama manually."
    exit 1
fi

echo "Updating packages..."
$PM update -y

echo "Installing Node.js and Git..."
$PM install nodejs git -y

echo "Checking for Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "Ollama not found. Please install it from https://ollama.com"
    echo "On Linux: curl -fsSL https://ollama.com/install.sh | sh"
else
    echo "Ollama is already installed."
fi

echo "Cloning OmniServer repository..."
git clone https://github.com/adhilka/tiny-server.git omniserver
cd omniserver

echo "Installing dependencies..."
npm install

echo "Setup complete!"
echo "To start the server, run: npm run dev"
echo "Ensure Ollama is running in another terminal tab: ollama serve"
