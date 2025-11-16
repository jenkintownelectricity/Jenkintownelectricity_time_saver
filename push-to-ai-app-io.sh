#!/bin/bash

echo "🚀 Pushing New_and_Improved to AI_app_IO"
echo "========================================="
echo ""

# Add remote if it doesn't exist
if git remote | grep -q "ai-app"; then
    echo "✓ Remote 'ai-app' already exists"
else
    echo "✓ Adding AI_app_IO as remote..."
    git remote add ai-app https://github.com/jenkintownelectricity/AI_app_IO.git
fi

echo ""
echo "📤 Pushing to AI_app_IO main branch..."
echo ""

# Push the New_and_Improved branch to AI_app_IO main
git push ai-app claude/New_and_Improved-015UH3vdJE2EobBeWaN9aJs1:main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to AI_app_IO!"
    echo ""
    echo "🎯 Next Steps:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "1. Vercel will auto-deploy in 2-3 minutes"
    echo "   Monitor: https://vercel.com/armands-projects-71de70b0/ai-app-io"
    echo ""
    echo "2. Your app will be live at:"
    echo "   https://ai-app-io.vercel.app"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo ""
    echo "❌ Push failed. You may need to authenticate with GitHub."
    echo ""
    echo "Try running: gh auth login"
    echo "Or push manually from your local machine"
    echo ""
fi
