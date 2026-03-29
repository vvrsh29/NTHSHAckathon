#!/bin/bash
# LaunchPad — one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/vvrsh29/NTHSHAckathon/main/setup.sh | bash

set -e

echo ""
echo "  🚀 LaunchPad Installer"
echo "  ======================"
echo ""

# Check for git
if ! command -v git &>/dev/null; then
  echo "  ❌ Git is required but not installed."
  echo "     Install it from https://git-scm.com"
  exit 1
fi

# Check for Node.js
if ! command -v node &>/dev/null; then
  echo "  ❌ Node.js is required but not installed."
  echo "     Install it from https://nodejs.org"
  exit 1
fi

NODE_VERSION=$(node -v)
echo "  ✓ Git found"
echo "  ✓ Node.js $NODE_VERSION found"
echo ""

# Clone
if [ -d "launchpad" ]; then
  echo "  → launchpad/ already exists, pulling latest..."
  cd launchpad
  git pull
else
  echo "  → Cloning LaunchPad..."
  git clone https://github.com/vvrsh29/NTHSHAckathon.git launchpad
  cd launchpad
fi

echo "  → Installing dependencies (this may take a minute)..."
npm install --silent 2>&1 | tail -1

echo ""
echo "  ✅ LaunchPad is ready!"
echo ""
echo "  Optional: Set your Anthropic API key for AI mentor features:"
echo "    export ANTHROPIC_API_KEY=sk-ant-..."
echo ""
echo "  Starting LaunchPad..."
echo ""

npm run dev
