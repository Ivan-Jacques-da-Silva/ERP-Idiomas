#!/bin/bash
set -e

echo "📦 Installing dependencies for EduManage School ERP..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "✅ All dependencies installed successfully!"
