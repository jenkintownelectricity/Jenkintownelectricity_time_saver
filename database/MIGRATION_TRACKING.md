# 📋 Migration Tracking

Keep track of which migrations have been applied to your database.

> **Quick Start:** See [SETUP_CHECKLIST.md](./SETUP_CHECKLIST.md) for step-by-step instructions!

---

## ✅ **Applied Migrations**

| Migration | Description | Date Applied | Applied By | Status |
|-----------|-------------|--------------|------------|--------|
| `schema.sql` | Initial database setup | _pending_ | - | ⏳ Not run |
| `002_row_level_security.sql` | RLS security policies | _pending_ | - | ⏳ Not run |
| `003_seed_data.sql` | Demo data (optional) | _skip_ | - | ⏭️ Skip in production |

---

## 📝 **How to Use**

1. **Before running a migration:**
   - Read the migration file
   - Understand what it does
   - Backup your data if needed

2. **Run the migration:**
   - Copy SQL from migration file
   - Paste in Supabase SQL Editor
   - Click "Run"

3. **Mark as complete:**
   - Update table above with date and your name
   - Change status to ✅ Complete

4. **Track in git:**
   - Commit this file after each migration
   - Helps team know what's been run

---

## 🚨 **Important Notes**

- **Never skip migrations** - they must run in order!
- **Never edit applied migrations** - create a new one instead
- **Always test in development first**
- **Backup production data** before running migrations

---

## 📌 **Future Migrations**

When you create new migrations, add them here:

| Migration | Description | Date Applied | Status |
|-----------|-------------|--------------|--------|
| `004_your_feature.sql` | Add your description | _pending_ | ⏳ Not run |

---

## 💡 **Tips**

- Use descriptive migration names (e.g., `005_add_messaging_system.sql`)
- Keep migrations small and focused on one feature
- Test migrations locally before production
- Document breaking changes clearly

---

**Last Updated:** [Initial setup]
**Database Version:** 0.1.0
