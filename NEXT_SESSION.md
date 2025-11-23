# Instructions for Next Claude Code Session

This document provides complete context for continuing this project in a new Claude Code session.

## 🎯 Quick Context

**Project**: Jenkintown Electricity Time Saver
**Type**: Next.js 16 business management app with AI phone integration
**Current Branch**: `claude/production-combined-app-011CqeWY1BKpSb19tviTANoA`
**Last Session**: January 20, 2025

## 📋 Session Startup Checklist

When starting a new session, do this FIRST:

```bash
# 1. Check current branch
git branch --show-current

# 2. If not on production branch, switch to it
git checkout claude/production-combined-app-011CqeWY1BKpSb19tviTANoA

# 3. Pull latest changes
git pull origin claude/production-combined-app-011CqeWY1BKpSb19tviTANoA

# 4. Check status
git status

# 5. Install dependencies (if needed)
npm install

# 6. Run dev server to verify everything works
npm run dev
```

## 🎨 What This App Does

### Core Functionality
1. **AI Phone Agents**: 4 specialized AI agents for different call types
   - ⚡ Electrical/HVAC/Plumbing Specialist
   - 🏠 Home Restoration Specialist
   - 💼 Office Assistant
   - 💰 Sales Specialist

2. **Phone Systems**:
   - **VAPI**: AI-powered voice calls with transcription
   - **HiVE215**: Manage up to 10 phone numbers

3. **Lead Management**: Automatic lead capture from all phone calls

4. **Database**: Full persistence in Supabase PostgreSQL

### Key Pages
- `/calls` - VAPI calls dashboard with database loading
- `/leads` - Lead management system
- `/hive215-config` - Phone number configuration
- `/settings?tab=api-keys` - API key configuration with test buttons

## 🗄️ Database Status

### ✅ Migrations Completed (1-8)
All previous migrations have been run.

### ⚠️ PENDING MIGRATION (CRITICAL!)
**Migration 009** MUST be run in Supabase:
- **File**: `database/migrations/009_vapi_calls_integration.sql`
- **Purpose**: Creates `vapi_calls` and `vapi_call_analytics` tables
- **Required For**: Call logging to work properly

**How to Run**:
1. Go to Supabase dashboard
2. Open SQL Editor
3. Copy entire contents of `database/migrations/009_vapi_calls_integration.sql`
4. Paste and run
5. Verify tables were created:
   ```sql
   SELECT * FROM vapi_calls LIMIT 1;
   SELECT * FROM vapi_call_analytics LIMIT 1;
   ```

### Database Tables
```
✅ user_profiles
✅ companies
✅ company_members
✅ contacts
✅ financial_documents
✅ work_calls
✅ call_statistics
✅ leads
✅ lead_activities
✅ webhook_configs
✅ hive215_phone_numbers
✅ hive215_call_logs
✅ hive215_integration_config
⚠️ vapi_calls (migration 009 needed)
⚠️ vapi_call_analytics (migration 009 needed)
```

## 🔑 Environment & Configuration

### Required Environment Variables
```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional - can be set via UI in Settings → API Keys
NEXT_PUBLIC_VAPI_KEY=your_vapi_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### User-Configurable Settings (via UI)
Users configure these in **Settings → API Keys**:
- VAPI Public API Key
- VAPI Assistant ID
- VAPI Agent Type (electrical/restoration/office/sales)
- Anthropic API Key
- QuickBooks, Stripe (future)

## 📁 Important Files & Their Purpose

### Configuration Files
- `database/migrations/009_vapi_calls_integration.sql` - **MUST RUN IN SUPABASE**
- `BRANCH_LOG.md` - Complete branch history
- `NEXT_SESSION.md` - This file (continuation guide)
- `README.md` - Complete project documentation

### Key Implementation Files
- `app/api/vapi/webhook/route.ts` - Handles VAPI call events, saves to DB
- `app/api/webhooks/hive215/route.ts` - Handles HiVE215 calls, saves to DB
- `app/api/vapi/test/route.ts` - Server-side VAPI credential testing
- `app/api/anthropic/test/route.ts` - Server-side Anthropic testing
- `components/vapi/call-list.tsx` - Loads calls from database
- `components/settings/api-keys-settings.tsx` - API key configuration UI
- `lib/store.ts` - Zustand store with `vapiAgentType` field

### AI Agent Files
- `app/ai-agents/electrical-hvac-plumbing-agent.ts`
- `app/ai-agents/home-restoration-agent.ts`
- `app/ai-agents/office-assistant-agent.ts`
- `app/ai-agents/salesman-agent.ts`
- `app/ai-agents/README.md` - Agent documentation

## 🔄 How Things Work

### Call Flow (VAPI)
```
User calls → VAPI answers with selected agent
↓
Webhook: call.started
↓
Save to vapi_calls table (status: 'in_progress')
↓
Call happens (AI extracts data from transcript)
↓
Webhook: call.ended
↓
Update vapi_calls (add transcript, duration, recording)
Extract customer info (name, email, service type)
Determine urgency (emergency/routine)
↓
Create lead in leads table
↓
Link call to lead (update vapi_calls.lead_id)
↓
Show in /calls and /leads dashboards
```

### Call Flow (HiVE215)
```
User calls one of 10 phone numbers
↓
HiVE215 handles call
↓
Webhook to /api/webhooks/hive215
↓
Save to hive215_call_logs table
↓
Create lead in leads table
↓
Database trigger updates phone number stats
↓
Show in /hive215-config stats
```

## 🚨 Known Issues & Gotchas

### 1. Database Migration 009
- **Issue**: Not yet run in production Supabase
- **Impact**: VAPI calls won't persist to database
- **Fix**: Run the migration (see Database Status section)

### 2. Branch Naming Convention
- **CRITICAL**: Branch must start with `claude/` and end with session ID
- **Why**: Required for git push authentication
- **Format**: `claude/description-{sessionId}`
- **Example**: `claude/production-combined-app-011CqeWY1BKpSb19tviTANoA`

### 3. API Keys in Store
- **Note**: API keys are stored in Zustand (browser localStorage)
- **Location**: `lib/store.ts` - `apiKeys` object
- **Fields**:
  ```typescript
  {
    vapi: string | null,
    vapiAssistantId: string | null,
    vapiAgentType: string | null,  // 'electrical' | 'restoration' | 'office' | 'sales'
    anthropic: string | null,
    quickbooks: string | null,
    stripe: string | null
  }
  ```

### 4. Call Loading
- **Current**: Calls load from database on page mount
- **Limit**: Last 100 calls
- **Sort**: Newest first
- **State**: Combined from database + Zustand store

## ✅ What's Working

- ✅ Navigation (Leads, Integrations, HiVE215 Config)
- ✅ AI agent selection (3 locations: Settings, Calls, HiVE215)
- ✅ Server-side API testing (VAPI, Anthropic)
- ✅ VAPI webhook receives calls
- ✅ HiVE215 webhook receives calls
- ✅ Automatic lead creation from calls
- ✅ Database persistence for both call types
- ✅ Call list loads from database
- ✅ Lead management system
- ✅ TypeScript build (no errors)
- ✅ All tests pass

## 🎯 Immediate Next Steps

### For User (Before Next Session)
1. Deploy current branch to Vercel production
2. Run database migration 009 in Supabase
3. Configure VAPI API keys in production Settings
4. Test a real call and verify it logs

### For Next Claude Session

**Priority 1: Verification**
1. Verify migration 009 was run successfully
2. Check if calls are logging to database in production
3. Verify leads are being created from calls

**Priority 2: Enhancements**
- Add real-time call updates (WebSocket or polling)
- Build call analytics dashboard with charts
- Add call recording playback UI
- Implement call-to-lead linking in UI
- Add filters for call analytics (by agent, date, urgency)

**Priority 3: Features**
- Add per-phone-number agent assignment for HiVE215
- Implement appointment scheduling from calls
- Add SMS notifications for new leads
- Create call quality scoring
- Build lead nurturing workflows

## 💡 Tips for Next Developer

### Quick Debugging
```bash
# Check if database tables exist
# Run in Supabase SQL Editor:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE '%vapi%';

# Check recent calls
SELECT * FROM vapi_calls
ORDER BY created_at DESC
LIMIT 5;

# Check recent leads
SELECT * FROM leads
WHERE source = 'vapi_call'
ORDER BY created_at DESC
LIMIT 5;
```

### Testing Webhooks Locally
```bash
# Use ngrok to expose local server
ngrok http 3000

# Set VAPI webhook URL to: https://your-ngrok-url.ngrok.io/api/vapi/webhook
# Set HiVE215 webhook URL to: https://your-ngrok-url.ngrok.io/api/webhooks/hive215
```

### Common Commands
```bash
# Build and check for errors
npm run build

# Run type checking
npx tsc --noEmit

# Format code
npx prettier --write .

# Check git status
git status

# View recent commits
git log --oneline -10
```

## 📞 Contact Flow Summary

### VAPI Setup
1. User signs up at vapi.ai
2. Creates assistant in VAPI dashboard
3. Gets Public API Key and Assistant ID
4. Enters in Settings → API Keys
5. Selects AI agent type
6. Tests connection (should see ✅)
7. Calls now log automatically

### HiVE215 Setup
1. User has HiVE215 account with up to 10 numbers
2. Goes to HiVE215 Config page
3. Copies webhook URL
4. Configures in HiVE215 dashboard
5. Adds phone numbers to database
6. Calls now log and create leads

## 🔐 Security Notes

- All API keys stored in browser localStorage (Zustand)
- Server-side API testing (keys never exposed to browser in requests)
- Row Level Security (RLS) enabled on all Supabase tables
- Webhook secret validation for HiVE215
- HTTPS required for webhooks in production

## 📊 Performance Notes

- Calls limited to 100 on load (pagination TODO)
- Database indexes on all foreign keys
- Triggers for automatic stats updates
- Analytics pre-aggregated by hour

## 🎓 Learning Resources

If you need to understand the codebase:

1. **Start with**: `README.md` - Complete overview
2. **Then read**: `BRANCH_LOG.md` - What was built when
3. **Check**: `app/ai-agents/README.md` - AI agent details
4. **Review**: Database migrations in order (001-009)
5. **Explore**: `/app/calls/page.tsx` - See how UI works

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run migration 009 in Supabase
- [ ] Set environment variables in Vercel
- [ ] Test API connection buttons work
- [ ] Make a test call and verify it logs
- [ ] Check lead was created from call
- [ ] Verify call appears in dashboard
- [ ] Test HiVE215 webhook (if configured)
- [ ] Monitor Vercel logs for errors

## 📝 Commit Message Style

This project uses conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Format code
refactor: Refactor code
test: Add tests
chore: Update dependencies
```

## 🙋 Common Questions

**Q: Where are the API keys stored?**
A: In browser localStorage via Zustand store (`lib/store.ts`)

**Q: How do I test webhooks locally?**
A: Use ngrok to expose localhost:3000, then configure webhook URLs to point to your ngrok URL

**Q: Why aren't calls showing up?**
A: Check if migration 009 was run in Supabase. Check browser console for errors. Verify webhook URL is correct.

**Q: How do I change the AI agent?**
A: Go to Settings → API Keys → AI Agent Type → Select from dropdown

**Q: Where are call recordings stored?**
A: Recording URLs are stored in `vapi_calls.recording_url` field. Actual files hosted by VAPI.

---

**Last Updated**: January 20, 2025
**For Questions**: Review README.md and BRANCH_LOG.md
**Session ID**: 011CqeWY1BKpSb19tviTANoA
