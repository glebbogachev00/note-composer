#!/bin/bash

echo "Setting up [note] Visual Music Composer..."

# Fix npm permissions if needed
if [ -d "$HOME/.npm" ]; then
    echo "Fixing npm permissions..."
    sudo chown -R $(whoami) "$HOME/.npm"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start development server
echo "Starting development server..."
npm run dev