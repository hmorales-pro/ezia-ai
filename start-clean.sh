#!/bin/bash
# Clean start script to avoid cache issues

echo "Cleaning Next.js cache..."
rm -rf .next/cache

echo "Starting production server..."
npm start