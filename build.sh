#!/bin/bash
echo "🚀 Building Al-Sha'er Family Website..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies and build
echo "📦 Installing client dependencies..."
cd client
npm install

echo "🏗️ Building client..."
npm run build
cd ..

echo "✅ Build completed successfully!"
