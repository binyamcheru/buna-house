#!/bin/bash

echo "🔍 Validating Project Setup..."
echo ""

errors=0

# Check critical files
files=(
  "lib/cache.ts"
  "lib/supabase-storage.ts"
  "lib/error-handler.ts"
  "lib/performance-monitor.ts"
  "lib/rate-limiter.ts"
  "lib/request-cache.ts"
  "app/icon.svg"
  "app/apple-icon.svg"
  "public/og-image.svg"
  "next.config.ts"
  "app/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - MISSING"
    ((errors++))
  fi
done

echo ""
echo "📦 Checking package.json..."
if grep -q "next" package.json; then
  echo "✅ Next.js configured"
else
  echo "❌ Next.js missing"
  ((errors++))
fi

echo ""
echo "🎨 Checking optimizations in next.config.ts..."
if grep -q "compress: true" next.config.ts; then
  echo "✅ Compression enabled"
else
  echo "⚠️  Compression not enabled"
fi

if grep -q "supabase.co" next.config.ts; then
  echo "✅ Supabase images configured"
else
  echo "⚠️  Supabase images not configured"
fi

echo ""
echo "🧪 Checking app/page.tsx for caching..."
if grep -q "localStorage" app/page.tsx; then
  echo "✅ Browser caching implemented"
else
  echo "⚠️  Browser caching not found"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $errors -eq 0 ]; then
  echo "✅ ALL CHECKS PASSED! Ready to test!"
  echo ""
  echo "🚀 Next step: npm run dev"
else
  echo "❌ Found $errors critical errors. Check above."
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
