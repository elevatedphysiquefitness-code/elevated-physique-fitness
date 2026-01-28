#!/bin/bash

# ============================================
# ELEVATED PHYSIQUE FITNESS - COMPLETE SETUP
# ============================================

echo "🏋️ Elevated Physique Fitness - Setup Script"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Found package.json${NC}"

# Step 1: Check Node.js
echo ""
echo "Step 1: Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${YELLOW}→ node_modules exists, checking for updates...${NC}"
fi
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

# Step 3: Check environment file
echo ""
echo "Step 3: Checking environment configuration..."
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"

    # Check for required variables
    MISSING_VARS=()

    if ! grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_URL")
    fi
    if ! grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        MISSING_VARS+=("NEXT_PUBLIC_SUPABASE_ANON_KEY")
    fi
    if ! grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        MISSING_VARS+=("SUPABASE_SERVICE_ROLE_KEY")
    fi
    if ! grep -q "NEXT_PUBLIC_PAYPAL_CLIENT_ID" .env.local; then
        MISSING_VARS+=("NEXT_PUBLIC_PAYPAL_CLIENT_ID")
    fi

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo -e "${YELLOW}⚠ Missing environment variables:${NC}"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
    else
        echo -e "${GREEN}✓ All required environment variables present${NC}"
    fi
else
    echo -e "${RED}✗ .env.local not found${NC}"
    echo "Creating template .env.local..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# PayPal Plan IDs
NEXT_PUBLIC_PAYPAL_PLAN_UNLIMITED=your-plan-id
NEXT_PUBLIC_PAYPAL_PLAN_ELEVATED_PHYSIQUE=your-plan-id
NEXT_PUBLIC_PAYPAL_PLAN_PHYSIQUE=your-plan-id
NEXT_PUBLIC_PAYPAL_PLAN_ELEVATED=your-plan-id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    echo -e "${YELLOW}→ Template .env.local created. Please update with your actual values.${NC}"
fi

# Step 4: Run TypeScript check
echo ""
echo "Step 4: Running TypeScript check..."
npx tsc --noEmit 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ TypeScript check passed${NC}"
else
    echo -e "${YELLOW}⚠ TypeScript has some issues (may be expected)${NC}"
fi

# Step 5: Build the project
echo ""
echo "Step 5: Building project..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Summary
echo ""
echo "============================================"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo ""
echo "1. If you haven't already, set up your Supabase database:"
echo "   - Go to: https://supabase.com/dashboard"
echo "   - Run the SQL schema in the SQL Editor"
echo ""
echo "2. Configure PayPal webhook:"
echo "   - Add webhook URL: https://your-domain.com/api/paypal/webhook"
echo "   - Subscribe to: BILLING.SUBSCRIPTION.* events"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Open in browser:"
echo "   http://localhost:3000"
echo ""
echo "============================================"
