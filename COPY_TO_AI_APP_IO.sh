#!/bin/bash

echo "🚀 Copying All Code to AI_app_IO Repository"
echo "============================================"
echo ""

# Step 1: Clone AI_app_IO if not already cloned
if [ ! -d "../AI_app_IO" ]; then
    echo "📥 Cloning AI_app_IO repository..."
    cd /home/user
    git clone https://github.com/jenkintownelectricity/AI_app_IO.git
    cd AI_app_IO
else
    echo "✓ AI_app_IO already exists"
    cd ../AI_app_IO
fi

# Step 2: Create/switch to main branch
echo "🌿 Switching to main branch..."
git checkout main 2>/dev/null || git checkout -b main

# Step 3: Copy all files from Jenkintownelectricity_time_saver
echo "📋 Copying all files..."
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' /home/user/Jenkintownelectricity_time_saver/ /home/user/AI_app_IO/

# Step 4: Add all files
echo "➕ Adding files to git..."
git add -A

# Step 5: Commit
echo "💾 Committing changes..."
git commit -m "feat: Complete Supabase integration with Realtime, Storage, and Scalable Database

## Complete Integration
- 19 database tables + 2 materialized views
- Supabase Realtime for instant notifications
- 6 storage buckets for files
- Usage quotas and feature gates
- Full-text search
- Migration tools (Zustand → Supabase)
- Complete documentation

See SUPABASE_INTEGRATION_COMPLETE.md for details."

# Step 6: Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo ""
echo "✅ Done! Code pushed to AI_app_IO"
echo "🔗 https://github.com/jenkintownelectricity/AI_app_IO"
echo ""
echo "Vercel will auto-deploy at:"
echo "https://ai-app-io.vercel.app"
echo ""
