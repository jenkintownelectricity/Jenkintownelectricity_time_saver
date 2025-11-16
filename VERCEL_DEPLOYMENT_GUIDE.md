# 🚀 Deploy to Vercel - Quick Guide

Your code is ready to deploy! Here's how to deploy to Vercel in **3 easy steps**:

---

## ✅ Option 1: Deploy via Vercel Dashboard (Recommended - 2 Minutes)

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"** or **"Import Project"**
3. Click **"Import Git Repository"**
4. Select **`jenkintownelectricity/Jenkintownelectricity_time_saver`**
5. Click **"Import"**

### Step 2: Configure Environment Variables

Before deploying, add these environment variables:

**Click "Environment Variables" and add:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://etofgqxycitcmkvbjidw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2ZncXh5Y2l0Y21rdmJqaWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzY5MjYsImV4cCI6MjA3ODgxMjkyNn0.F7hMxiubtFRPEn9_LUZqQkCjVaKCt-n76LIAbwdXKUI
SUPABASE_SERVICE_ROLE_KEY=sb_secret_KJR9xnMp4u7nlepO45ZBcA_MLRhhgBp

# Optional: Add these when you get API keys
ANTHROPIC_API_KEY=your_anthropic_key_here
NEXT_PUBLIC_VAPI_KEY=your_vapi_key_here
VAPI_ASSISTANT_ID=your_vapi_assistant_id_here
```

**Important**: Make sure to select **"Production"**, **"Preview"**, and **"Development"** for all variables!

### Step 3: Deploy!

Click **"Deploy"** and wait 2-3 minutes.

**That's it!** Your app will be live at `https://your-project.vercel.app`

---

## ✅ Option 2: Deploy via Vercel CLI (Advanced)

If you prefer the command line:

### 1. Login to Vercel

```bash
vercel login
```

Enter your email and click the verification link.

### 2. Deploy

```bash
vercel --prod
```

### 3. Add Environment Variables

After first deployment, add environment variables in Vercel Dashboard:

1. Go to your project settings
2. Click "Environment Variables"
3. Add the variables from above

### 4. Redeploy

```bash
vercel --prod
```

---

## 🔧 Post-Deployment Setup

After deployment, you need to set up your Supabase database:

### Option A: Automatic Setup (SSH into Vercel)

If you have SSH access to Vercel:

```bash
npm run db:setup
npm run db:storage
```

### Option B: Manual Setup (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/etofgqxycitcmkvbjidw)
2. Click **SQL Editor** in the left sidebar
3. Run these files in order:
   - Copy/paste `database/schema.sql` → Click "Run"
   - Copy/paste `database/migrations/002_row_level_security.sql` → Click "Run"
   - Copy/paste `database/migrations/003_seed_data.sql` → Click "Run"
   - Copy/paste `database/migrations/004_feature_gates_and_monetization.sql` → Click "Run"
   - Copy/paste `database/migrations/005_additional_tables_and_enhancements.sql` → Click "Run"

4. Create Storage Buckets:
   - Go to **Storage** in Supabase Dashboard
   - Click **"New bucket"**
   - Create these 6 buckets:
     - `receipts` (Public, 10MB limit)
     - `photos` (Public, 10MB limit)
     - `documents` (Private, 20MB limit)
     - `avatars` (Public, 2MB limit)
     - `logos` (Public, 2MB limit)
     - `attachments` (Private, 50MB limit)

---

## 🎯 Verify Deployment

Once deployed, test these pages:

1. **Homepage**: `https://your-project.vercel.app/`
2. **Login**: `https://your-project.vercel.app/login`
3. **Signup**: `https://your-project.vercel.app/signup`

Check browser console for any errors.

---

## 🔐 Security Checklist

Before going live:

- ✅ Environment variables are set in Vercel
- ✅ Supabase RLS policies are enabled
- ✅ Service role key is kept secret (never in client code)
- ✅ Storage bucket policies are configured
- ✅ Test authentication flow
- ✅ Test file uploads

---

## 🐛 Troubleshooting

### "Supabase connection failed"
- Check environment variables are set correctly in Vercel Dashboard
- Make sure you selected "Production" environment for all variables

### "Database tables not found"
- Run the manual database setup (Option B above)
- Check Supabase logs for errors

### "Storage upload failed"
- Create the 6 storage buckets manually in Supabase Dashboard
- Check bucket permissions

### Build errors
- Check Vercel build logs
- Make sure all dependencies are in `package.json`
- Try rebuilding: `vercel --prod --force`

---

## 📊 Monitor Your Deployment

After deployment, monitor:

1. **Vercel Dashboard**: Build logs, function logs, analytics
2. **Supabase Dashboard**: Database queries, storage usage, API usage
3. **Real-time subscriptions**: Check they're working in production

---

## 🚀 Your Deployment Checklist

- [ ] Push code to GitHub (✅ Already done!)
- [ ] Connect repository to Vercel
- [ ] Add environment variables
- [ ] Deploy to production
- [ ] Run database migrations in Supabase
- [ ] Create storage buckets
- [ ] Test the live site
- [ ] Enable monitoring and alerts

---

## 🎉 You're Live!

Once deployed, your app will be available at:
- **Production**: `https://your-project.vercel.app`
- **Preview**: Auto-deployed for every push to non-main branches

Every push to your branch will auto-deploy to Vercel! 🚀

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Everything is ready to deploy! Just follow Option 1 above. Takes 2 minutes. 🎯**
