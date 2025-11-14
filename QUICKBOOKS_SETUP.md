# QuickBooks Integration Setup Guide

This guide will walk you through setting up QuickBooks integration for your Electrician Assistant app.

## Overview

The QuickBooks integration allows you to:
- Sync estimates to QuickBooks
- Sync invoices to QuickBooks
- Automatically match customers
- Track payments and balances

## Prerequisites

- A QuickBooks Online account
- An Intuit Developer account
- Your app deployed on Vercel (or another hosting platform)

---

## Step 1: Create a QuickBooks App

1. **Go to Intuit Developer Portal**
   - Visit: https://developer.intuit.com
   - Sign in with your Intuit account (or create one)

2. **Create a New App**
   - Click "Create an App" or "My Apps" → "Create new app"
   - Choose **"QuickBooks Online Accounting"** as the platform
   - Give your app a name (e.g., "Electrician Assistant Integration")

3. **Configure App Settings**
   - Go to your app's "Keys & credentials" section
   - Find your **Client ID** and **Client Secret** - you'll need these later
   - Keep this page open - we'll come back to it

---

## Step 2: Configure OAuth Redirect URI

1. **In your QuickBooks App Settings**
   - Go to the "Keys & credentials" tab
   - Scroll to "Redirect URIs"

2. **Add Redirect URI**

   For **Production (Vercel)**:
   ```
   https://your-app-name.vercel.app/api/quickbooks/callback
   ```

   For **Local Development**:
   ```
   http://localhost:3000/api/quickbooks/callback
   ```

   Replace `your-app-name.vercel.app` with your actual Vercel URL.

3. **Save Changes**

---

## Step 3: Add Environment Variables to Vercel

1. **Open Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Select your project

2. **Navigate to Settings**
   - Click "Settings" in the top navigation
   - Click "Environment Variables" in the left sidebar

3. **Add the Following Variables**

   | Variable Name | Value | Example |
   |--------------|-------|---------|
   | `QUICKBOOKS_CLIENT_ID` | Your Client ID from Step 1 | `ABCxyz123...` |
   | `QUICKBOOKS_CLIENT_SECRET` | Your Client Secret from Step 1 | `xyz789ABC...` |
   | `NEXT_PUBLIC_APP_URL` | Your Vercel app URL | `https://your-app.vercel.app` |

4. **Important: Select Environment**
   - Make sure to add these to **Production**, **Preview**, and **Development** environments
   - Or at minimum, add to Production

5. **Redeploy Your App**
   - After adding environment variables, you MUST redeploy
   - Go to "Deployments" tab
   - Click the "..." menu on your latest deployment
   - Click "Redeploy"
   - OR: Just push a new commit to trigger a deployment

---

## Step 4: Connect QuickBooks in Your App

1. **Open Your App**
   - Go to your deployed app URL

2. **Navigate to Settings**
   - Click on "Settings" in the main navigation
   - Click on the "Integrations" tab

3. **Find QuickBooks Section**
   - Scroll to the "QuickBooks Integration" card

4. **Click "Connect QuickBooks"**
   - You'll be redirected to Intuit's authorization page
   - Sign in to your QuickBooks account
   - Select the company you want to connect
   - Click "Authorize"

5. **Authorization Complete**
   - You'll be redirected back to your app
   - The QuickBooks section should now show "Connected"

---

## Step 5: Test the Integration

1. **Create a Test Estimate**
   - Go to "Estimates" section
   - Create a new estimate with some line items

2. **Sync to QuickBooks**
   - Open the estimate
   - Click the "Sync QB" button
   - You should see a success message

3. **Verify in QuickBooks**
   - Open your QuickBooks Online account
   - Go to Sales → Estimates
   - You should see your estimate there!

---

## Local Development Setup

If you're developing locally, you also need to set up environment variables:

1. **Create `.env.local` file** in your project root:

```bash
# QuickBooks Integration
QUICKBOOKS_CLIENT_ID="your_client_id_here"
QUICKBOOKS_CLIENT_SECRET="your_client_secret_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

2. **Restart your development server**:
```bash
npm run dev
```

3. **Make sure redirect URI is configured** for `http://localhost:3000/api/quickbooks/callback` in your QuickBooks app settings

---

## Troubleshooting

### Error: "QuickBooks not configured"

**Problem**: Environment variables are not set or app hasn't been redeployed.

**Solution**:
1. Verify variables are in Vercel Dashboard → Settings → Environment Variables
2. Make sure you added `QUICKBOOKS_CLIENT_ID` and `QUICKBOOKS_CLIENT_SECRET`
3. Redeploy your app after adding variables

### Error: "Redirect URI mismatch"

**Problem**: The redirect URI in your QuickBooks app doesn't match your app's URL.

**Solution**:
1. Go to developer.intuit.com → Your App → Keys & credentials
2. Add the exact redirect URI: `https://your-app.vercel.app/api/quickbooks/callback`
3. Make sure there are no trailing slashes or typos

### Error: "Invalid Client ID"

**Problem**: Client ID or Secret is incorrect.

**Solution**:
1. Double-check the values in Vercel environment variables
2. Copy them again from developer.intuit.com → Your App → Keys & credentials
3. Redeploy after updating

### Sync Fails with "Customer not found"

**Problem**: QuickBooks can't find a customer with the same name.

**Solution**:
1. Make sure customer exists in QuickBooks with exact same name
2. Or create the customer in QuickBooks first
3. Future enhancement: We'll add automatic customer creation

---

## Security Best Practices

1. **Never commit** `.env.local` to git (it's already in `.gitignore`)
2. **Keep your Client Secret secure** - never share it publicly
3. **Use production credentials only in production** - consider separate dev/prod apps
4. **Rotate credentials** if you suspect they've been compromised

---

## API Endpoints Reference

Your app has these QuickBooks API endpoints:

- `GET /api/quickbooks/auth` - Initiates OAuth flow
- `GET /api/quickbooks/callback` - Handles OAuth callback
- `POST /api/quickbooks/sync-estimate` - Syncs an estimate
- `POST /api/quickbooks/sync-invoice` - Syncs an invoice

---

## Support

- **QuickBooks Developer Docs**: https://developer.intuit.com/app/developer/qbo/docs/get-started
- **Intuit Developer Support**: https://help.developer.intuit.com

---

## What Gets Synced?

### Estimates
- Customer name and info
- Line items (description, quantity, rate, total)
- Subtotal, tax rate, tax amount, total
- Estimate number and date
- Expiry date
- Notes and terms

### Invoices
- Customer name and info
- Line items (description, quantity, rate, total)
- Subtotal, tax rate, tax amount, total
- Invoice number, date, due date
- Amount paid and balance
- Notes, terms, and payment terms

---

## Next Steps

Once you have QuickBooks connected:

1. Try syncing a few test estimates
2. Sync invoices to track payments
3. Use QuickBooks reports for accounting
4. Consider syncing work orders (future feature)

Enjoy seamless accounting integration! 🎉
