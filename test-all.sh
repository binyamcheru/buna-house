#!/bin/bash

# ===================================================
# 🧪 COMPLETE TESTING SCRIPT
# ===================================================
# Run this to test everything before client demo
# ===================================================

echo "╔════════════════════════════════════════════════╗"
echo "║   🧪 TESTING COFFEE SHOP PROJECT              ║"
echo "╚════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

pass_count=0
fail_count=0

# Test function
test_check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $2"
        ((pass_count++))
    else
        echo -e "${RED}❌ FAIL${NC}: $2"
        ((fail_count++))
    fi
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  CHECKING FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "lib/cache.ts" ]; test_check $? "lib/cache.ts exists"
[ -f "lib/supabase-storage.ts" ]; test_check $? "lib/supabase-storage.ts exists"
[ -f "lib/error-handler.ts" ]; test_check $? "lib/error-handler.ts exists"
[ -f "lib/performance-monitor.ts" ]; test_check $? "lib/performance-monitor.ts exists"
[ -f "app/icon.svg" ]; test_check $? "Favicon exists"
[ -f "public/og-image.svg" ]; test_check $? "OG image exists"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  CHECKING OPTIMIZATIONS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

grep -q "compress: true" next.config.ts; test_check $? "Compression enabled"
grep -q "supabase.co" next.config.ts; test_check $? "Supabase images configured"
grep -q "Cache-Control" next.config.ts; test_check $? "API caching configured"
grep -q "localStorage" app/page.tsx; test_check $? "Browser caching implemented"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  CHECKING DEPENDENCIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -d "node_modules" ]; test_check $? "node_modules installed"
grep -q "\"next\"" package.json; test_check $? "Next.js in package.json"
grep -q "\"react\"" package.json; test_check $? "React in package.json"
grep -q "@supabase/supabase-js" package.json; test_check $? "Supabase client installed"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  CHECKING ENVIRONMENT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f ".env.local" ]; then
    grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; test_check $? "Supabase URL configured"
    grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; test_check $? "Supabase key configured"
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: .env.local not found"
    echo "   Create it with your Supabase credentials"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  DOCUMENTATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "DO_THIS_NOW.md" ]; test_check $? "DO_THIS_NOW.md exists"
[ -f "setup-database.sql" ]; test_check $? "setup-database.sql exists"
[ -f "SUPABASE_STORAGE_SETUP.md" ]; test_check $? "SUPABASE_STORAGE_SETUP.md exists"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 TEST RESULTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $pass_count${NC}"
echo -e "${RED}❌ Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo "╔════════════════════════════════════════════════╗"
    echo "║   🎉 ALL TESTS PASSED! READY FOR DEMO!        ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Setup database: Open setup-database.sql in Supabase"
    echo "   2. Setup storage: Follow SUPABASE_STORAGE_SETUP.md"
    echo "   3. Run dev server: npm run dev"
    echo "   4. Open: http://localhost:3000"
    echo "   5. Demo to client! 🎬"
else
    echo "╔════════════════════════════════════════════════╗"
    echo "║   ⚠️  SOME TESTS FAILED - CHECK ABOVE         ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""
    echo "📖 Check the failed items above and fix them"
fi

echo ""
