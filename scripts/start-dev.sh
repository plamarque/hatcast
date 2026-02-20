#!/bin/bash
# Start the development server (exposes on all interfaces for testing from phone/other devices)
# Usage: ./scripts/start-dev.sh

cd "$(dirname "$0")/.."
npm run dev -- --host
