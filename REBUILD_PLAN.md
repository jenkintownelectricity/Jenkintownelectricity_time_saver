# COMPLETE FRONTEND REBUILD - ARCHITECTURE PLAN

**Project:** AppIo.AI - Construction AI Assistant
**Scope:** Complete frontend rebuild from scratch
**Timeline:** Multi-session comprehensive build
**Credits Available:** $900 Claude Code credits

---

## CORE REQUIREMENTS

### 1. RECEIPT TRACKER & TAX COMPLIANCE SYSTEM

#### Receipt Management
- **Receipt Capture:**
  - Photo upload (camera or file)
  - OCR text extraction (vendor, date, amount, category)
  - Manual entry for non-receipt expenses
  - Batch upload support

- **Receipt Organization:**
  - Categorization (materials, labor, tools, fuel, meals, mileage, other)
  - Tagging system (job-specific, overhead, personal)
  - Vendor tracking
  - Payment method tracking (cash, card, check)
  - Notes and descriptions

- **Receipt Storage:**
  - Image storage with thumbnails
  - PDF conversion
  - Search and filter
  - Sorting (date, amount, vendor, category)

#### Tax Compliance Features
- **Quarterly Tax Tracking:**
  - Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec)
  - Automatic quarter detection
  - Quarterly summaries by category
  - Estimated tax payment tracking

- **Annual Tax Reports:**
  - Schedule C preparation data
  - Categorized expense totals
  - Mileage logs (IRS-compliant)
  - Home office deduction calculator
  - Equipment depreciation tracker (Section 179)

- **Tax Document Organization:**
  - W-9 forms storage
  - 1099 tracking (received and sent)
  - License and permit tracking
  - Insurance policy documents
  - Bank and credit card statements

- **Mileage Tracking:**
  - Trip logging (date, from, to, miles, purpose)
  - Automatic IRS rate application
  - Business vs personal classification
  - Monthly/quarterly/annual summaries

- **Deduction Maximization:**
  - Home office calculator
  - Vehicle expense tracking (actual vs standard mileage)
  - Tool and equipment purchases
  - Phone and internet allocation
  - Continuing education expenses

- **Toggle Feature:**
  - Enable/disable entire tax area
  - Settings configuration per company
  - Privacy controls

---

### 2. VAPI ASSISTANT INTEGRATION

#### Call Handling System
- **Incoming Call Management:**
  - VAPI webhook integration
  - Call metadata capture (caller ID, duration, timestamp)
  - Real-time transcript capture
  - Call recording storage (if permitted)
  - Caller identification (new vs existing customer)

- **Appointment Scheduling:**
  - Extract scheduling requests from conversation
  - Date/time parsing from natural language
  - Service type identification
  - Address extraction
  - Availability checking
  - Calendar slot assignment
  - Confirmation generation

- **Data Extraction:**
  - Customer name and contact info
  - Service requested
  - Location/address
  - Urgency level (emergency, routine, scheduled)
  - Budget/price expectations
  - Special requirements

- **Spreadsheet Integration:**
  - Auto-populate appointment data
  - Lead tracking spreadsheet
  - Call log export
  - CSV/Excel export functionality
  - Google Sheets integration (optional)

#### VAPI Configuration
- **Assistant Setup:**
  - Custom prompts for contractor business
  - Scheduling logic integration
  - FAQ handling
  - Transfer to human option

- **Voice & Personality:**
  - Professional contractor tone
  - Configurable business hours
  - Emergency vs routine call routing
  - Multi-language support (future)

---

### 3. COMPLETE FRONTEND FEATURE LIST

#### Core Features (Must Have)
1. **Authentication System**
   - Login page
   - Signup page
   - Password reset
   - Email verification
   - Session management

2. **Dashboard/Home**
   - Quick stats (revenue, calls, jobs)
   - Recent activity feed
   - Upcoming appointments
   - Action items/reminders

3. **Customer Management**
   - Customer list (searchable, filterable)
   - Customer detail pages
   - Contact information management
   - Address book with multiple addresses
   - Communication history
   - Notes and tags

4. **Estimate System**
   - Create estimates
   - Line item editor (materials, labor, equipment)
   - Tax calculation
   - PDF generation
   - Email delivery
   - Status tracking (draft, sent, approved, declined)
   - Convert to work order

5. **Work Order System**
   - Create from estimates
   - Job assignment to team members
   - Status tracking (scheduled, in progress, completed)
   - Photo documentation
   - Time tracking
   - Convert to invoice

6. **Invoice System**
   - Create from work orders
   - Payment tracking (partial, full)
   - Due date management
   - Payment reminders
   - PDF generation
   - Email delivery
   - Payment link generation

7. **Team Management**
   - Team member profiles
   - Role assignment
   - Availability/scheduling
   - Performance metrics
   - Communication tools

8. **Company/DBA Management**
   - Multiple company profiles
   - Logo upload
   - Business information
   - License tracking
   - Insurance tracking
   - Company switching

9. **Receipt Tracker** (NEW)
   - Full system as described above

10. **Tax Compliance Area** (NEW)
    - Full system as described above

11. **VAPI Call Management** (NEW)
    - Full system as described above

12. **Appointment Scheduler** (NEW)
    - Calendar view
    - Appointment booking
    - Availability management
    - Reminder system

13. **Photo Analysis**
    - Upload electrical photos
    - AI analysis (wire gauge, panel reading, compliance)
    - Safety recommendations
    - Photo library

14. **NEC Code Lookup**
    - Search electrical codes
    - Bookmark favorites
    - Quick reference guide

15. **Settings**
    - API key management
    - Integration settings
    - User preferences
    - Company settings
    - Tax area toggle

#### Advanced Features (Phase 2)
- Call bidding system
- Network marketplace
- QuickBooks integration
- Email integration (Gmail/Outlook)
- Payment processing (Stripe)
- Review management
- Contractor network

---

### 4. UI COMPONENT LIBRARY

#### Base Components
- Button (primary, secondary, destructive, ghost, link)
- Input (text, number, email, password, search)
- Textarea
- Select/Dropdown
- Checkbox
- Radio button
- Toggle/Switch
- Slider
- Date picker
- Time picker
- Color picker
- File upload (with drag & drop)
- Avatar
- Badge
- Chip/Tag
- Progress bar
- Spinner/Loading indicator

#### Layout Components
- Container
- Grid
- Flex box
- Card
- Panel
- Sidebar
- Header
- Footer
- Navigation
- Breadcrumbs
- Tabs
- Accordion
- Divider

#### Interactive Components
- Modal/Dialog
- Alert/Toast
- Tooltip
- Popover
- Dropdown menu
- Context menu
- Command palette
- Search
- Pagination
- Table (with sorting, filtering)
- Data grid
- Calendar
- Chart (bar, line, pie, donut)

#### Form Components
- Form wrapper
- Form field
- Form label
- Form error
- Form helper text
- Form validation
- Multi-step form
- Form wizard

#### Specialized Components
- PDF viewer
- Image gallery
- File browser
- Rich text editor
- Code editor
- Map integration
- Signature pad
- QR code generator
- Barcode scanner

---

### 5. NAVIGATION STRUCTURE

```
├── Home/Dashboard
├── Calls & Appointments
│   ├── Incoming Calls (VAPI)
│   ├── Call History
│   ├── Appointments
│   └── Calendar
├── Customers
│   ├── Customer List
│   ├── Add Customer
│   └── Customer Details
├── Jobs & Projects
│   ├── Estimates
│   ├── Work Orders
│   └── Invoices
├── Receipts & Expenses (TOGGLEABLE)
│   ├── Receipt Tracker
│   ├── Expense Categories
│   ├── Mileage Log
│   └── Receipt Search
├── Tax Compliance (TOGGLEABLE)
│   ├── Quarterly Reports
│   ├── Annual Summary
│   ├── Tax Documents
│   ├── Deduction Tracker
│   └── Export for Accountant
├── Team
│   ├── Team Members
│   ├── Schedules
│   └── Performance
├── Company
│   ├── Company Profiles
│   ├── Business Info
│   └── Licenses & Insurance
├── Tools
│   ├── Voice Assistant
│   ├── Photo Analysis
│   └── NEC Lookup
└── Settings
    ├── Account
    ├── Integrations
    ├── API Keys
    └── Preferences
```

---

### 6. DATA STRUCTURES

#### Receipt
```typescript
interface Receipt {
  id: string
  userId: string
  companyId: string
  date: Date
  vendor: string
  amount: number
  category: ReceiptCategory
  paymentMethod: PaymentMethod
  description: string
  notes: string
  tags: string[]
  jobId?: string
  images: string[] // URLs
  ocrText?: string
  taxYear: number
  taxQuarter: 1 | 2 | 3 | 4
  isTaxDeductible: boolean
  isPersonal: boolean
  createdAt: Date
  updatedAt: Date
}

enum ReceiptCategory {
  MATERIALS = 'materials',
  LABOR = 'labor',
  TOOLS = 'tools',
  EQUIPMENT = 'equipment',
  FUEL = 'fuel',
  VEHICLE = 'vehicle',
  MEALS = 'meals',
  OFFICE = 'office',
  INSURANCE = 'insurance',
  LICENSES = 'licenses',
  PERMITS = 'permits',
  EDUCATION = 'education',
  MARKETING = 'marketing',
  PHONE = 'phone',
  INTERNET = 'internet',
  RENT = 'rent',
  UTILITIES = 'utilities',
  OTHER = 'other'
}
```

#### Mileage Log
```typescript
interface MileageLog {
  id: string
  userId: string
  companyId: string
  date: Date
  fromLocation: string
  toLocation: string
  miles: number
  purpose: string
  jobId?: string
  customerId?: string
  isBusinessMiles: boolean
  irsRate: number // Auto-populated by year
  deductionAmount: number // miles * irsRate
  taxYear: number
  taxQuarter: 1 | 2 | 3 | 4
  createdAt: Date
}
```

#### VAPI Call
```typescript
interface VAPICall {
  id: string
  userId: string
  companyId: string
  callId: string // VAPI call ID
  callerPhone: string
  callerName?: string
  duration: number // seconds
  transcript: string
  recording?: string // URL
  extractedData: {
    customerName?: string
    customerPhone?: string
    customerEmail?: string
    address?: string
    serviceRequested?: string
    preferredDate?: string
    preferredTime?: string
    urgency?: 'emergency' | 'routine' | 'scheduled'
    budget?: number
    notes?: string
  }
  appointmentCreated: boolean
  appointmentId?: string
  customerId?: string
  status: 'completed' | 'missed' | 'followup_needed'
  createdAt: Date
}
```

#### Appointment
```typescript
interface Appointment {
  id: string
  userId: string
  companyId: string
  customerId: string
  jobId?: string
  title: string
  description: string
  serviceType: string
  location: Address
  scheduledDate: Date
  scheduledTime: string
  duration: number // minutes
  assignedTo?: string // team member ID
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  reminderSent: boolean
  source: 'vapi' | 'manual' | 'customer_portal'
  vapiCallId?: string
  notes: string
  createdAt: Date
  updatedAt: Date
}
```

---

### 7. TESTING STRATEGY

#### Unit Testing
- Component rendering
- Form validation
- Data transformation functions
- Utility functions

#### Integration Testing
- VAPI webhook handling
- Receipt OCR extraction
- Tax calculation accuracy
- PDF generation
- Spreadsheet export

#### End-to-End Testing
- Complete user flows:
  1. VAPI call → Appointment → Work Order → Invoice
  2. Receipt upload → Categorization → Tax report
  3. Customer creation → Estimate → Approval → Work Order → Invoice
  4. Team member assignment → Job completion → Payment

#### Manual Testing Checklist
- [ ] All buttons clickable and functional
- [ ] All forms submit correctly
- [ ] All navigation links work
- [ ] All modals open and close
- [ ] All data persists correctly
- [ ] All calculations are accurate
- [ ] All PDFs generate correctly
- [ ] All emails send (if integrated)
- [ ] All VAPI calls process correctly
- [ ] All spreadsheet exports work
- [ ] Tax calculations are IRS-compliant
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Error handling (network errors, validation errors)
- [ ] Loading states for all async operations

---

### 8. TECHNOLOGY STACK

#### Framework
- Next.js 16 (App Router)
- React 19
- TypeScript 5

#### UI Libraries
- Tailwind CSS v4
- shadcn/ui components
- Radix UI primitives
- lucide-react icons

#### State Management
- Zustand (temporary, before database)
- React Query (for server state later)

#### Forms
- React Hook Form
- Zod validation

#### PDF Generation
- @react-pdf/renderer

#### File Handling
- OCR: Tesseract.js or Cloud Vision API
- Image compression: browser-image-compression
- File upload: native File API

#### Voice/AI
- VAPI SDK (@vapi-ai/web)
- Anthropic Claude API

#### Spreadsheet
- XLSX library for export
- Google Sheets API (optional)

#### Calendar
- date-fns for date manipulation
- react-day-picker for calendar UI

---

### 9. BUILD PHASES

#### Phase 1: Foundation (Current)
- [x] Project architecture plan
- [ ] Core UI component library
- [ ] Navigation and layout
- [ ] Authentication pages (already exist)

#### Phase 2: Receipt & Tax System
- [ ] Receipt capture UI
- [ ] OCR integration
- [ ] Receipt categorization
- [ ] Receipt search and filter
- [ ] Mileage log UI
- [ ] Tax quarterly reports
- [ ] Tax annual summary
- [ ] Deduction calculators
- [ ] Tax document storage
- [ ] Export functionality

#### Phase 3: VAPI & Appointments
- [ ] VAPI webhook endpoint
- [ ] Call transcript processing
- [ ] Data extraction logic
- [ ] Appointment scheduler UI
- [ ] Calendar view
- [ ] Availability management
- [ ] Reminder system
- [ ] Spreadsheet export

#### Phase 4: Core Business Features
- [ ] Customer management
- [ ] Estimate system
- [ ] Work order system
- [ ] Invoice system
- [ ] PDF generation for all docs
- [ ] Email templates

#### Phase 5: Team & Company
- [ ] Team member management
- [ ] Company/DBA profiles
- [ ] User roles and permissions
- [ ] Company switching

#### Phase 6: AI Tools
- [ ] Voice assistant interface
- [ ] Photo analysis
- [ ] NEC code lookup

#### Phase 7: Settings & Configuration
- [ ] Settings panel
- [ ] API key management
- [ ] Integration setup
- [ ] Feature toggles
- [ ] User preferences

#### Phase 8: Testing & Polish
- [ ] Comprehensive testing
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

#### Phase 9: Database Design
- [ ] Database schema document
- [ ] Migration plan
- [ ] Data model diagrams

---

### 10. SUCCESS CRITERIA

**Frontend is complete when:**
- ✅ All 32 todos are completed
- ✅ Every feature has a working UI
- ✅ All buttons and interactions work
- ✅ Receipt tracker is fully functional
- ✅ Tax compliance area works correctly
- ✅ VAPI integration processes calls
- ✅ Appointments can be scheduled
- ✅ Spreadsheet export works
- ✅ All PDFs generate correctly
- ✅ All forms validate properly
- ✅ Navigation works everywhere
- ✅ No TypeScript errors
- ✅ Build succeeds
- ✅ All manual tests pass

**Then we build the database together.**

---

## EXECUTION BEGINS NOW

Starting systematic build of all components and features...
