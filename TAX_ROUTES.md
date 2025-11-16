# Tax System Routes

Access the tax compliance system through these routes:

## Main Routes

### `/tax`
**Tax Dashboard**
- Overview of current quarter and year-to-date statistics
- Quick action buttons
- Recent mileage entries
- Recent documents
- Quarterly tax payment alerts

### `/tax/mileage`
**Mileage Log**
- Add, edit, delete mileage entries
- Track business vs personal miles
- View summaries by period
- Export to CSV
- Automatic deduction calculation

### `/tax/reports`
**Tax Reports**
- Quarterly Reports tab:
  - Select year and quarter (Q1-Q4)
  - View revenue, expenses, deductions
  - Track quarterly estimated payments
  - Export to CSV/PDF

- Annual Summary tab:
  - Complete Schedule C preparation
  - Expense breakdown by category
  - Tax liability calculation
  - 1099 income tracking
  - Export for accountant

### `/tax/documents`
**Tax Documents**
- Upload and organize tax documents
- Filter by year and type
- Search functionality
- Track 1099 income
- Manage receipts

### `/tax/deductions`
**Deduction Calculators & Settings**
- Deduction Calculator tab:
  - Home Office Calculator
  - Vehicle Expense Calculator
  - Meal Deduction Calculator
  - Phone/Internet Calculator

- Tax Settings tab:
  - Configure home office details
  - Set vehicle expense method
  - Define business use percentages
  - Set tax rates
  - Accountant information

## Quick Access URLs

For development:
- http://localhost:3000/tax
- http://localhost:3000/tax/mileage
- http://localhost:3000/tax/reports
- http://localhost:3000/tax/documents
- http://localhost:3000/tax/deductions

## Navigation Flow

```
/tax (Dashboard)
  ├── Quick Actions
  │   ├── Add Mileage → /tax/mileage
  │   ├── Upload Document → /tax/documents
  │   ├── View Reports → /tax/reports
  │   └── Deduction Calculator → /tax/deductions
  │
  ├── Current Quarter Stats
  │   └── View Report → /tax/reports
  │
  └── Recent Activity
      ├── View All Mileage → /tax/mileage
      └── View All Documents → /tax/documents
```

## URL Parameters (Future Enhancement)

Ready for implementation:
- `/tax/reports?year=2024&quarter=1` - Direct link to specific quarter
- `/tax/mileage?period=month` - Filter mileage by period
- `/tax/documents?year=2024&type=1099` - Filter documents
