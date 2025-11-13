# 🚀 Deploying AppIo.AI to Vercel

This guide will walk you through deploying AppIo.AI to Vercel in under 5 minutes.

## Prerequisites

- GitHub account with this repository
- [Vercel account](https://vercel.com) (free tier works perfectly)
- Your API keys ready:
  - VAPI API key from [vapi.ai](https://vapi.ai)
  - Anthropic API key from [console.anthropic.com](https://console.anthropic.com)

## Step-by-Step Deployment

### 1. Go to Vercel

Visit [vercel.com](https://vercel.com) and sign in with your GitHub account.

### 2. Import Your Repository

1. Click **"Add New..."** → **"Project"**
2. Select **"Import Git Repository"**
3. Find `Jenkintownelectricity_time_saver` in your repositories
4. Click **"Import"**

### 3. Configure Your Project

Vercel will auto-detect Next.js. You should see:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

✅ **Leave these as default** - they're already optimized!

### 4. Add Environment Variables

Before deploying, click **"Environment Variables"** and add:

#### Required Variables:

**VAPI Voice AI:**
```
Name: NEXT_PUBLIC_VAPI_KEY
Value: [Your VAPI public key]
```

**Anthropic Claude:**
```
Name: ANTHROPIC_API_KEY
Value: [Your Anthropic API key]
```

#### Optional Variables:

```
Name: VAPI_ASSISTANT_ID
Value: [Your VAPI assistant ID if you have one]
```

**Important:** 
- Make sure to select **"Production"**, **"Preview"**, and **"Development"** for each variable
- Click **"Add"** after each one

### 5. Deploy!

1. Click **"Deploy"**
2. Wait 2-3 minutes while Vercel builds your app
3. 🎉 **Your app is live!**

### 6. Get Your Live URL

Once deployed, you'll see:
```
🎉 Congratulations! Your project is live at:
https://your-app-name.vercel.app
```

## Post-Deployment

### Test Your Deployment

1. Open your live URL
2. Go to **Settings** and verify your API keys are working
3. Test the Voice AI feature
4. Test the Photo Analysis feature
5. Test NEC Code Lookup

### Custom Domain (Optional)

Want a custom domain like `appio.ai`?

1. Go to your project **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain and follow DNS setup instructions

### Update Your App

Every time you push to GitHub, Vercel automatically:
- Builds your changes
- Deploys to production
- Keeps your environment variables secure

## Troubleshooting

### Build Failed?

Check the build logs in Vercel dashboard for errors.

### API Keys Not Working?

1. Verify keys are added correctly in Vercel dashboard
2. Make sure `NEXT_PUBLIC_` prefix is only on `VAPI_KEY`
3. Redeploy after adding/updating variables

### Still Having Issues?

- Check [Vercel Documentation](https://vercel.com/docs)
- Visit [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- Open an issue on GitHub

## Performance Tips

Your app is already optimized for Vercel with:
- ✅ Server-side rendering (SSR)
- ✅ Static page generation
- ✅ Edge functions for API routes
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero-config deployment

## What's Next?

- Share your live URL with users
- Monitor usage in Vercel Analytics
- Set up custom domain
- Add more features!

---

**🎉 Congratulations!** You've deployed AppIo.AI - the world's most intuitive construction AI assistant!
