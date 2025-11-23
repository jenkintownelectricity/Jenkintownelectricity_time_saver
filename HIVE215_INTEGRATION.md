# 📞 HiVE215 Integration Guide

Complete guide for integrating your HiVE215 phone system with AppIo.AI for automatic lead capture from all 10 phone numbers.

---

## 🎯 Overview

The HiVE215 integration automatically:
- ✅ Captures calls from all 10 phone numbers
- ✅ Creates leads in your system
- ✅ Extracts contact info from transcripts
- ✅ Assigns leads based on phone number
- ✅ Tracks stats per phone line
- ✅ Supports emergency priority routing

---

## 🚀 Quick Start

### 1. Configure Webhook in HiVE215

**Webhook URL:**
```
https://your-domain.vercel.app/api/webhooks/hive215
```

**Headers to Add:**
```
x-hive215-secret: your_secret_key_here
```

**Events to Subscribe:**
- `call.completed`
- `call.missed`
- `voicemail.received`

### 2. Set Up Phone Numbers

Visit `/hive215-config` in your AppIo.AI dashboard to:
- Add your 10 phone numbers
- Configure department assignments
- Set business hours
- Define auto-assignment rules

### 3. Test the Integration

Send a test call or use the webhook test feature:

```bash
curl -X POST https://your-domain.vercel.app/api/webhooks/hive215 \
  -H "Content-Type: application/json" \
  -H "x-hive215-secret: your_secret_key" \
  -d '{
    "event": "call.completed",
    "call_id": "test_123",
    "phone_number": "+1-555-1234",
    "caller_number": "+1-555-5678",
    "caller_name": "John Doe",
    "duration": 300,
    "transcript": "I need emergency electrical work",
    "service_type": "emergency"
  }'
```

---

## 📊 Dashboard Features

Access your HiVE215 dashboard at: **`/hive215-config`**

### Real-Time Stats
- Active phone lines (X/10)
- Total calls received
- Leads generated
- Emergency line status

### Phone Number Management
Each phone number card shows:
- Phone number and name
- Department assignment
- Total calls and leads
- Last call timestamp
- Active/inactive status
- Emergency line indicator

### Webhook Configuration
- Copy-paste webhook URL
- Step-by-step setup guide
- Test integration button
- Documentation link

---

## 🔧 Configuration Options

### Phone Number Settings

```sql
-- Example phone number configuration
{
  "phone_number": "+1-555-1234",
  "name": "Main Line",
  "department": "Sales",
  "assigned_to": "user_id_here",
  "auto_assign_leads": true,
  "is_emergency_line": false,
  "business_hours": {
    "monday": {"start": "09:00", "end": "17:00"},
    "tuesday": {"start": "09:00", "end": "17:00"},
    // ... other days
  }
}
```

### Auto-Assignment Rules

Configure automatic lead assignment based on:
- Phone number called
- Time of day
- Department
- Service type
- Priority level

---

## 📞 Payload Formats

### HiVE215 Standard Format

```json
{
  "event": "call.completed",
  "call_id": "hive215_123456",
  "phone_number": "+1-555-1234",
  "caller_number": "+1-555-5678",
  "caller_name": "John Doe",
  "caller_email": "john@example.com",
  "duration": 300,
  "timestamp": "2025-01-19T10:30:00Z",
  "transcript": "Full call transcript here...",
  "summary": "Customer needs electrical work",
  "service_type": "emergency",
  "priority": "urgent",
  "address": "123 Main St",
  "city": "Philadelphia",
  "state": "PA",
  "zip": "19104",
  "budget": 5000,
  "description": "Need rewiring for office",
  "recording_url": "https://...",
  "metadata": {}
}
```

### Simplified Format (Also Supported)

```json
{
  "from": "+1-555-5678",
  "to": "+1-555-1234",
  "duration": 300,
  "recording_url": "https://...",
  "transcript": "I need help with electrical work..."
}
```

---

## 🤖 Intelligent Data Extraction

The system automatically extracts:

### Contact Information
- Name (from transcript: "my name is...", "I'm...")
- Email (pattern matching)
- Phone number (caller ID)

### Service Classification
- **Electrical**: wiring, outlet, breaker, panel, circuit
- **Emergency**: emergency, urgent, asap, immediately
- **Installation**: install, installation, new, add
- **Repair**: repair, fix, broken, not working
- **Commercial**: commercial, business, office, store
- **Residential**: home, house, residential

### Priority Detection
- **Urgent**: Contains emergency keywords
- **High**: Budget > $10,000
- **Medium**: Default for most calls
- **Low**: Non-urgent, informational

### Lead Scoring (0-100)
Automatic scoring based on:
- +20 points: Has email
- +20 points: Has phone
- +15 points: Has budget
- +10 points: Detailed description
- +25 points: Urgent priority
- +15 points: High priority
- +5 points: Medium priority
- Up to +10: Based on follow-ups

---

## 🔄 Call Flow

```
1. Customer calls one of your 10 numbers
   ↓
2. HiVE215 handles the call
   ↓
3. Call completes → Webhook sent to AppIo.AI
   ↓
4. AppIo.AI receives webhook at /api/webhooks/hive215
   ↓
5. Data extracted and lead created
   ↓
6. Lead assigned based on phone number config
   ↓
7. Notification sent to assigned user (optional)
   ↓
8. Stats updated in real-time
```

---

## 📈 Tracking & Analytics

### Per Phone Number
- Total calls received
- Leads generated
- Conversion rate
- Average call duration
- Last call timestamp

### Overall Stats
- Active lines / 10
- Total calls across all lines
- Total leads generated
- Emergency vs regular calls
- Busiest phone lines

### Call Logs
Complete history of:
- Call ID
- Duration
- Transcript
- Lead created (yes/no)
- Caller information
- Recording URL

---

## 🔐 Security

### Webhook Authentication

Add secret header to validate webhooks:

```
x-hive215-secret: your_secret_key_here
```

Configure in HiVE215:
1. Go to Settings → Webhooks
2. Add Custom Header
3. Name: `x-hive215-secret`
4. Value: Generate a secure random string

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Security
- Row Level Security (RLS) enabled
- User-level access control
- Encrypted sensitive data
- Audit logging

---

## 🛠️ Database Schema

### Tables Created

#### `hive215_phone_numbers`
Manages your 10 phone numbers with:
- Phone number and name
- Department and assignment
- Business hours
- Auto-assignment rules
- Stats (calls, leads)
- Active/inactive status

#### `hive215_call_logs`
Complete call history:
- Call ID and duration
- Caller information
- Transcript and summary
- Lead association
- Recording URL

#### `hive215_integration_config`
Integration settings:
- API key (encrypted)
- Webhook secret
- Feature flags
- Sync settings

### Run Migrations

```bash
# In Supabase SQL Editor, run:
database/migrations/007_hive215_integration.sql
```

---

## 🎨 UI Components

### Phone Number Card Features
- **Glassmorphism design** for modern look
- **Color-coded badges** for departments
- **Pulsing animation** for emergency lines
- **Real-time stats** with animated counters
- **Hover effects** with 3D transforms
- **One-click configuration** buttons

### Dashboard Animations
- Staggered card entrance
- Smooth transitions
- Skeleton loading states
- Gradient mesh background
- Interactive elements

---

## 📝 Example Scenarios

### Scenario 1: Emergency Call
```
1. Customer calls emergency line (+1-555-0002)
2. Says: "I need emergency electrical help right now"
3. Lead created with:
   - Priority: Urgent
   - Tags: [emergency, hive215]
   - Auto-assigned to on-call electrician
   - Notification sent immediately
```

### Scenario 2: Sales Inquiry
```
1. Customer calls sales line (+1-555-0003)
2. Discusses project: "Office rewiring, budget $15,000"
3. Lead created with:
   - Priority: High (budget > $10k)
   - Tags: [sales, commercial, hive215]
   - Auto-assigned to sales team
   - Lead score: 85/100
```

### Scenario 3: General Inquiry
```
1. Customer calls main line (+1-555-0001)
2. Asks about services
3. Lead created with:
   - Priority: Medium
   - Tags: [general, hive215]
   - Assigned to general queue
   - Lead score: 45/100
```

---

## 🐛 Troubleshooting

### Webhook Not Receiving Calls

**Check:**
1. ✅ Webhook URL is correct
2. ✅ HiVE215 has correct events subscribed
3. ✅ Secret header is set correctly
4. ✅ AppIo.AI is deployed and running

**Test:**
```bash
# Test webhook endpoint
curl https://your-domain.vercel.app/api/webhooks/hive215

# Should return documentation
```

### Leads Not Being Created

**Check:**
1. ✅ Payload format is correct
2. ✅ Database migrations ran successfully
3. ✅ Check browser console for errors
4. ✅ Verify phone number exists in system

**Debug:**
```bash
# Check webhook logs in Vercel
vercel logs --follow

# Check Supabase logs
# Go to Supabase Dashboard → Logs
```

### Stats Not Updating

**Reason:** Database triggers handle stats automatically

**Solution:**
1. Verify triggers were created in migration
2. Check hive215_call_logs table has data
3. Refresh the dashboard page

---

## 🚀 Advanced Features

### Custom Assignment Rules

Define complex rules in JSON:

```json
{
  "rules": [
    {
      "condition": "time_of_day",
      "value": "after_hours",
      "assign_to": "on_call_user_id"
    },
    {
      "condition": "service_type",
      "value": "emergency",
      "assign_to": "emergency_team_id"
    },
    {
      "condition": "budget",
      "operator": ">",
      "value": 10000,
      "assign_to": "senior_sales_id"
    }
  ]
}
```

### Webhook Forwarding

Forward calls to multiple systems:

```javascript
// In webhook handler, add:
await fetch('https://crm.example.com/webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(leadData)
})
```

### AI Summary Enhancement

Integrate with Claude AI for better summaries:

```javascript
// Add to webhook processing
const summary = await generateAISummary(transcript)
leadData.vapi_summary = summary
```

---

## 📞 Support

### Need Help?

1. **Check Documentation**: This file + `/api/webhooks/hive215` GET endpoint
2. **Dashboard**: Visit `/hive215-config` for live status
3. **Logs**: Check Vercel and Supabase logs
4. **Test**: Use curl to test webhook manually

### Deployment Checklist

- [ ] Run database migrations
- [ ] Configure webhook URL in HiVE215
- [ ] Add webhook secret header
- [ ] Set up phone numbers
- [ ] Test with sample payload
- [ ] Verify lead creation
- [ ] Check stats update
- [ ] Configure auto-assignment

---

## 🎉 You're All Set!

Your HiVE215 integration is ready to:
- Capture calls from 10 phone numbers ✅
- Create leads automatically ✅
- Extract contact info intelligently ✅
- Track stats in real-time ✅
- Route leads to the right people ✅

**Access your dashboard:** `/hive215-config`

**Monitor leads:** `/leads`

**Enjoy automatic lead capture from every call!** 🚀

---

**Built with:**
- Next.js 16 + TypeScript
- Supabase (PostgreSQL)
- Framer Motion
- Tailwind CSS + Glassmorphism
- Modern 2025 UI/UX design trends
