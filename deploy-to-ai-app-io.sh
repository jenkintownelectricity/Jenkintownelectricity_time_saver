#!/bin/bash

echo "🚀 Deploying to AI_app_IO Repository"
echo "====================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Add remote if it doesn't exist
if git remote | grep -q "ai-app"; then
    echo -e "${BLUE}ℹ Remote 'ai-app' already exists${NC}"
else
    echo -e "${GREEN}✓ Adding AI_app_IO as remote...${NC}"
    git remote add ai-app https://github.com/jenkintownelectricity/AI_app_IO.git
fi

echo ""
echo -e "${YELLOW}📤 Pushing to AI_app_IO repository...${NC}"
echo ""

# Push to main branch
git push ai-app claude/scalable-db-design-015UH3vdJE2EobBeWaN9aJs1:main

echo ""
echo -e "${GREEN}✅ Code pushed successfully!${NC}"
echo ""
echo "🎯 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. Vercel will auto-deploy in 2-3 minutes"
echo "   Monitor at: https://vercel.com/armands-projects-71de70b0/ai-app-io"
echo ""
echo "2. Add Environment Variables (One time only):"
echo "   https://vercel.com/armands-projects-71de70b0/ai-app-io/settings/environment-variables"
echo ""
echo "   Add these 3 variables for Production, Preview, and Development:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL=https://etofgqxycitcmkvbjidw.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2ZncXh5Y2l0Y21rdmJqaWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzY5MjYsImV4cCI6MjA3ODgxMjkyNn0.F7hMxiubtFRPEn9_LUZqQkCjVaKCt-n76LIAbwdXKUI"
echo "   SUPABASE_SERVICE_ROLE_KEY=sb_secret_KJR9xnMp4u7nlepO45ZBcA_MLRhhgBp"
echo ""
echo "3. Set up Database (One time only):"
echo "   https://supabase.com/dashboard/project/etofgqxycitcmkvbjidw/sql"
echo ""
echo "   Run these SQL files in SQL Editor:"
echo "   • database/schema.sql"
echo "   • database/migrations/002_row_level_security.sql"
echo "   • database/migrations/003_seed_data.sql"
echo "   • database/migrations/004_feature_gates_and_monetization.sql"
echo "   • database/migrations/005_additional_tables_and_enhancements.sql"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Your app will be live at: https://ai-app-io.vercel.app${NC}"
echo ""
