#!/bin/bash

# EventYukk - Quick Start Script
# Script untuk menjalankan project dengan mudah

echo "🚀 EventYukk - Starting Application..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js tidak ditemukan!${NC}"
    echo "   Install Node.js v18+ dari https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version terlalu lama (v$NODE_VERSION)${NC}"
    echo "   Recommended: Node.js v18 atau lebih baru"
fi

echo -e "${GREEN}✅ Node.js $(node --version) detected${NC}"
echo ""

# Check MySQL
if ! command -v mysql &> /dev/null; then
    echo -e "${YELLOW}⚠️  MySQL CLI tidak ditemukan${NC}"
    echo "   Pastikan MySQL/MariaDB sudah terinstall dan running"
else
    echo -e "${GREEN}✅ MySQL CLI detected${NC}"
fi

echo ""
echo "📦 Checking dependencies..."

# Check backend dependencies
if [ ! -d "server/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Backend dependencies belum terinstall${NC}"
    echo "   Installing backend dependencies..."
    cd server && npm install && cd ..
fi

# Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Frontend dependencies belum terinstall${NC}"
    echo "   Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Check config.env
if [ ! -f "server/config.env" ]; then
    echo -e "${RED}❌ File server/config.env tidak ditemukan!${NC}"
    echo "   Buat file config.env dari contoh di README.md"
    exit 1
fi

echo -e "${GREEN}✅ Config file OK${NC}"
echo ""

# Ask which to run
echo "Pilih yang ingin dijalankan:"
echo "  1) Backend only (port 3000)"
echo "  2) Frontend only (port 5173)"
echo "  3) Both (Backend + Frontend) - Recommended"
echo ""
read -p "Pilihan [1/2/3] (default: 3): " choice
choice=${choice:-3}

case $choice in
    1)
        echo ""
        echo "🚀 Starting Backend Server..."
        cd server && npm run dev
        ;;
    2)
        echo ""
        echo "🚀 Starting Frontend Server..."
        cd frontend && npm run dev
        ;;
    3)
        echo ""
        echo "🚀 Starting Both Servers..."
        echo ""
        echo "Terminal 1: Backend (Port 3000)"
        echo "Terminal 2: Frontend (Port 5173)"
        echo ""
        echo "Opening in new terminals..."
        
        # Mac/Linux - open in new terminal
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            osascript -e 'tell app "Terminal" to do script "cd \"'"$(pwd)"'/server\" && npm run dev"' 2>/dev/null || \
            osascript -e 'tell application "Terminal" to do script "cd \"'"$(pwd)"'/server\" && npm run dev"' 2>/dev/null || \
            cd server && npm run dev
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            gnome-terminal -- bash -c "cd $(pwd)/server && npm run dev; exec bash" 2>/dev/null || \
            xterm -e "cd $(pwd)/server && npm run dev" 2>/dev/null || \
            cd server && npm run dev
        else
            echo ""
            echo "⚠️  Auto-open terminal tidak support di OS ini"
            echo "   Jalankan manual di 2 terminal terpisah:"
            echo "   Terminal 1: cd server && npm run dev"
            echo "   Terminal 2: cd frontend && npm run dev"
            echo ""
            read -p "Lanjutkan dengan backend di terminal ini? [y/N]: " confirm
            if [[ $confirm == [yY] ]]; then
                cd server && npm run dev
            fi
        fi
        ;;
    *)
        echo -e "${RED}❌ Pilihan tidak valid${NC}"
        exit 1
        ;;
esac

