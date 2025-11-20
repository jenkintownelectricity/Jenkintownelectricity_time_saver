# Jenkintown Electricity Time Saver

> Complete business management system with AI-powered phone integration, lead capture, and intelligent call routing.

## 🎯 Project Overview

This is a comprehensive Next.js application for electrical/HVAC/plumbing contractors featuring:
- **4 Specialized AI Phone Agents** (Electrical/HVAC/Plumbing, Home Restoration, Office Assistant, Sales)
- **VAPI Integration** for AI-powered voice calls
- **HiVE215 Integration** for phone number management (up to 10 numbers)
- **Automatic Lead Capture** from phone calls and webhooks
- **Call Logging & Analytics** with full database persistence
- **Customer Management** with flexible contact system
- **Financial Documents** (Invoices, Estimates, Work Orders)
- **Team Management** with work call bidding system

## ✨ Current Features

### 📞 Phone & AI Integration
- **VAPI Calls**: AI-powered phone assistant with 4 specialized agents
- **HiVE215 Integration**: Manage up to 10 phone numbers
- **Automatic Lead Generation**: Calls automatically create leads in database
- **Call Transcription**: Full transcripts with AI analysis
- **Smart Routing**: Assign calls by phone number or department
- **Call Analytics**: Performance tracking per agent type

### 🎯 Lead Management
- **Automatic Capture**: From VAPI calls, HiVE215, webhooks, and forms
- **Lead Scoring**: Automated scoring based on data quality and urgency
- **Activity Tracking**: Full history of all lead interactions
- **Assignment**: Auto-assign to team members by phone number
- **Lead Sharing**: Export and share leads via unique URLs
- **Priority Levels**: Urgent, High, Medium, Low

### 👥 AI Agents (All Configured)
1. **⚡ Electrical/HVAC/Plumbing Specialist**
   - Expert diagnostics and safety protocols
   - Instant pricing and scheduling
   - Emergency triage

2. **🏠 Home Restoration Specialist**
   - Crisis management for water/fire damage
   - Insurance navigation
   - Empathetic customer support

3. **💼 Office Assistant**
   - Scheduling and appointments
   - Billing questions
   - General customer service

4. **💰 Sales Specialist**
   - SPIN selling methodology
   - BANT qualification
   - Objection handling and closing

### 💰 Financial Management
- Invoices, Estimates, Quotes, Work Orders
- Line items with tax calculation
- Payment tracking
- Flexible document types

### 📊 Analytics & Reporting
- Call statistics by agent type
- Lead conversion tracking
- Performance metrics
- Cost tracking per call

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.2 with App Router & TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **State Management**: Zustand
- **Voice AI**: VAPI SDK
- **Vision AI**: Anthropic Claude 3.5 Sonnet
- **Phone System**: HiVE215 Integration
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/jenkintownelectricity/Jenkintownelectricity_time_saver.git
cd Jenkintownelectricity_time_saver

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🗄️ Database Setup

1. **Create Supabase Project** at [supabase.com](https://supabase.com)

2. **Run Migrations** in order:
   ```sql
   -- Run these in Supabase SQL Editor
   database/migrations/001_initial_schema.sql
   database/migrations/002_row_level_security.sql
   database/migrations/003_seed_data.sql
   database/migrations/004_feature_gates_and_monetization.sql
   database/migrations/005_additional_tables_and_enhancements.sql
   database/migrations/006_lead_capture_system.sql
   database/migrations/007_hive215_integration.sql
   database/migrations/008_lead_sharing_integrations.sql
   database/migrations/009_vapi_calls_integration.sql  ← NEW!
   ```

3. **Database Tables Created**:
   - `user_profiles` - User accounts
   - `companies` - Multi-tenant companies
   - `contacts` - Universal contacts (clients, vendors, etc.)
   - `financial_documents` - Invoices, estimates, work orders
   - `leads` - Lead capture and management
   - `lead_activities` - Lead activity tracking
   - `vapi_calls` - VAPI phone call logs (NEW!)
   - `vapi_call_analytics` - Call analytics (NEW!)
   - `hive215_phone_numbers` - Phone number management
   - `hive215_call_logs` - HiVE215 call logs
   - `webhook_configs` - Webhook configuration

## 🔑 API Keys Setup

Configure in **Settings → API Keys** (http://localhost:3000/settings?tab=api-keys):

### Required for Phone Features:
1. **VAPI API Key**
   - Sign up at [vapi.ai](https://vapi.ai)
   - Get your Public API Key
   - Get your Assistant ID
   - Choose AI agent type (Electrical, Restoration, Office, or Sales)
   - Test connection with built-in test button

2. **HiVE215 Configuration**
   - Configure at [HiVE215 Config](/hive215-config)
   - Set webhook URL: `https://your-domain.com/api/webhooks/hive215`
   - Add secret header: `x-hive215-secret`

### Optional:
3. **Anthropic API Key** (for photo analysis)
   - Sign up at [anthropic.com](https://anthropic.com)
   - Add API key in Settings

## 🚀 Quick Start Guide

### 1. Deploy to Vercel
```bash
# Push to GitHub first
git push origin main

# Deploy to Vercel
vercel deploy --prod
```

### 2. Configure VAPI (Tonight!)
1. Go to Settings → API Keys
2. Enter your VAPI Public API Key
3. Enter your VAPI Assistant ID
4. Choose your AI agent type
5. Test connection (should see ✅)

### 3. Set Up HiVE215
1. Go to HiVE215 Config
2. Copy webhook URL
3. Configure in HiVE215 dashboard
4. Add your 10 phone numbers

### 4. View Calls & Leads
- **VAPI Calls**: http://localhost:3000/calls
- **Leads**: http://localhost:3000/leads
- **HiVE215 Config**: http://localhost:3000/hive215-config

## 📞 Webhook Endpoints

### VAPI Webhook
```
POST /api/vapi/webhook
```
Receives call events from VAPI:
- `call.started` - Saves new call to database
- `call.ended` - Updates call, creates lead, extracts data
- `transcript.updated` - Real-time transcript updates

### HiVE215 Webhook
```
POST /api/webhooks/hive215
```
Receives call events from HiVE215:
- Creates call log in database
- Generates lead automatically
- Updates phone number statistics

### Test Endpoints
```
GET /api/vapi/test       - Test VAPI credentials
GET /api/anthropic/test  - Test Anthropic API key
```

## 📂 Project Structure

```
/app
  /api
    /vapi/webhook       - VAPI call events
    /vapi/test         - VAPI connection test
    /anthropic/test    - Anthropic connection test
    /webhooks/hive215  - HiVE215 integration
    /webhooks/leads    - Lead capture webhook
  /calls               - VAPI calls dashboard
  /leads               - Lead management
  /hive215-config      - Phone number config
  /settings            - App settings & API keys
  /ai-agents           - AI agent configurations
    /electrical-hvac-plumbing-agent.ts
    /home-restoration-agent.ts
    /office-assistant-agent.ts
    /salesman-agent.ts
    /README.md         - Agent documentation

/components
  /vapi               - VAPI-related components
  /settings           - Settings components
  /layout             - Layout components

/database
  /migrations         - Database migrations (run in order!)
  schema.sql         - Complete schema reference

/lib
  /stores            - Zustand state management
  /supabase          - Supabase client utilities
  /types             - TypeScript type definitions
```

## 🔄 Call Flow

### VAPI Call Flow:
```
1. Customer calls VAPI number
   ↓
2. AI agent answers (based on your selection)
   ↓
3. Webhook: call.started → Saved to vapi_calls table
   ↓
4. Conversation happens (AI extracts info)
   ↓
5. Webhook: call.ended
   ↓
6. Call updated with transcript, duration, recording
   ↓
7. Lead automatically created in leads table
   ↓
8. Call linked to lead
   ↓
9. Appears in /calls and /leads dashboards
```

### HiVE215 Call Flow:
```
1. Customer calls one of your 10 numbers
   ↓
2. HiVE215 handles the call
   ↓
3. Webhook sent to /api/webhooks/hive215
   ↓
4. Call saved to hive215_call_logs
   ↓
5. Lead created in leads table
   ↓
6. Phone number stats updated (via trigger)
   ↓
7. Appears in /hive215-config stats
```

## 🎨 Design System

- **Glassmorphism**: Modern glass-effect UI
- **Dark Mode Ready**: Optimized for all lighting
- **Mobile-First**: Responsive design
- **Animations**: Framer Motion for smooth interactions
- **Color Scheme**: Primary blue/purple gradient

## 🌿 Git Branch Information

See `BRANCH_LOG.md` for complete branch history and status.

**Current Production Branch**: `claude/production-combined-app-011CqeWY1BKpSb19tviTANoA`

## 📋 For Next Claude Code Session

See `NEXT_SESSION.md` for detailed continuation instructions.

## 🐛 Known Issues

None currently! All systems operational.

## 📝 Recent Changes

### Latest Session (2025-01-20)
- ✅ Added AI agent selection to VAPI Calls page
- ✅ Added AI agent selection to HiVE215 Config page
- ✅ Fixed API connection test buttons (server-side validation)
- ✅ Implemented full database persistence for VAPI calls
- ✅ Implemented full database persistence for HiVE215 calls
- ✅ Calls now persist across page refreshes
- ✅ Automatic lead creation from all calls
- ✅ Call analytics and tracking

## 🤝 Contributing

This is a private project for Jenkintown Electricity.

## 📄 License

Copyright © 2025 Jenkintown Electricity. All rights reserved.

---

**Jenkintown Electricity Time Saver** - Smarter business management with AI.
