-- ============================================
-- AppIo.AI PostgreSQL Database Schema
-- Portable schema - run this in any PostgreSQL instance
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users table (for multi-user support in future)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entity Types table (stores entity configurations)
CREATE TABLE entity_types (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_plural VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(50),
    enabled BOOLEAN DEFAULT true,
    fields JSONB NOT NULL,
    relationships JSONB,
    features JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Entities table (stores all business entities)
CREATE TABLE entities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL REFERENCES entity_types(id),
    status VARCHAR(50) DEFAULT 'active',
    data JSONB NOT NULL DEFAULT '{}',
    relationships JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Indexes for performance
    INDEX idx_entity_type (entity_type),
    INDEX idx_entity_status (status),
    INDEX idx_entity_created_at (created_at)
);

-- Contact Addresses table
CREATE TABLE contact_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- Billing, Shipping, Project Site, Office, Home, Other
    is_primary BOOLEAN DEFAULT false,
    street1 VARCHAR(255) NOT NULL,
    street2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'USA',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_address_entity (entity_id),
    INDEX idx_address_primary (is_primary)
);

-- Linked Contacts table
CREATE TABLE linked_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- Primary Contact, Billing Contact, etc.
    email VARCHAR(255),
    phone VARCHAR(50),
    title VARCHAR(100),
    notes TEXT,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_linked_contact_entity (entity_id),
    INDEX idx_linked_contact_primary (is_primary)
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_comment_entity (entity_id),
    INDEX idx_comment_created (created_at)
);

-- Attachments table
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    type VARCHAR(100),
    size BIGINT,
    uploaded_by UUID REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_attachment_entity (entity_id)
);

-- History/Audit table
CREATE TABLE entity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    field VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_history_entity (entity_id),
    INDEX idx_history_created (created_at)
);

-- ============================================
-- MY CONTRACTORS TABLES
-- ============================================

-- My Contractors (contractors you work FOR as a subcontractor)
CREATE TABLE my_contractors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    payment_terms VARCHAR(50) DEFAULT 'Net 30',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Estimates sent to contractors
CREATE TABLE my_contractor_estimates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES my_contractors(id) ON DELETE CASCADE,
    number VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    estimate_fee DECIMAL(12, 2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'Draft',
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_date TIMESTAMP,
    terms_and_conditions TEXT,
    include_terms BOOLEAN DEFAULT true,
    estimate_fee_invoice_id UUID,
    estimate_fee_paid BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contractor_estimate (contractor_id)
);

-- Invoices sent to contractors
CREATE TABLE my_contractor_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES my_contractors(id) ON DELETE CASCADE,
    number VARCHAR(100) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft',
    description TEXT,
    date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    terms_and_conditions TEXT,
    include_terms BOOLEAN DEFAULT true,
    related_estimate_id UUID REFERENCES my_contractor_estimates(id),
    is_estimate_fee_invoice BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contractor_invoice (contractor_id)
);

-- Work items for contractors
CREATE TABLE my_contractor_work (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contractor_id UUID NOT NULL REFERENCES my_contractors(id) ON DELETE CASCADE,
    job_number VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completion_date TIMESTAMP,
    payment_date TIMESTAMP,
    related_estimate_id UUID REFERENCES my_contractor_estimates(id),
    related_invoice_id UUID REFERENCES my_contractor_invoices(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_contractor_work (contractor_id)
);

-- ============================================
-- PAYMENT & REVIEW LINKS TABLES
-- ============================================

-- Payment methods (Get Paid Now)
CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'link' or 'qr'
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Review links (Get Review Now)
CREATE TABLE review_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'link' or 'qr'
    value TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- SETTINGS TABLE
-- ============================================

CREATE TABLE app_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entity_types_updated_at BEFORE UPDATE ON entity_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_entities_updated_at BEFORE UPDATE ON entities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_addresses_updated_at BEFORE UPDATE ON contact_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_linked_contacts_updated_at BEFORE UPDATE ON linked_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_my_contractors_updated_at BEFORE UPDATE ON my_contractors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_my_contractor_estimates_updated_at BEFORE UPDATE ON my_contractor_estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_my_contractor_invoices_updated_at BEFORE UPDATE ON my_contractor_invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_my_contractor_work_updated_at BEFORE UPDATE ON my_contractor_work
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA SEED
-- ============================================

-- Insert default entity types
INSERT INTO entity_types (id, name, name_plural, icon, color, enabled, fields, relationships, features)
VALUES
    ('customer', 'Customer', 'Customers', 'user', '#3b82f6', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('vendor', 'Vendor', 'Vendors', 'truck', '#06b6d4', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('subcontractor', 'Subcontractor', 'Subcontractors', 'users', '#ec4899', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('official', 'Official/Inspector', 'Officials & Inspectors', 'shield', '#6366f1', true,
     '[]'::jsonb, '{"jobs": {"type": "many-to-many", "targetEntity": "job", "enabled": true}}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('job', 'Job', 'Jobs', 'briefcase', '#10b981', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('estimate', 'Estimate', 'Estimates', 'calculator', '#f59e0b', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('workOrder', 'Work Order', 'Work Orders', 'clipboard', '#8b5cf6', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb),

    ('invoice', 'Invoice', 'Invoices', 'file-text', '#ef4444', true,
     '[]'::jsonb, '{}'::jsonb,
     '{"create": true, "read": true, "update": true, "delete": true, "export": true, "import": true, "duplicate": true, "archive": true, "comments": true, "attachments": true, "history": true, "notifications": true}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- HELPFUL QUERIES FOR MANAGEMENT
-- ============================================

-- View all entities with their addresses
CREATE OR REPLACE VIEW v_entities_with_addresses AS
SELECT
    e.id,
    e.entity_type,
    e.data,
    json_agg(
        json_build_object(
            'id', ca.id,
            'type', ca.type,
            'isPrimary', ca.is_primary,
            'street1', ca.street1,
            'street2', ca.street2,
            'city', ca.city,
            'state', ca.state,
            'zip', ca.zip,
            'country', ca.country,
            'notes', ca.notes
        )
    ) FILTER (WHERE ca.id IS NOT NULL) as addresses
FROM entities e
LEFT JOIN contact_addresses ca ON e.id = ca.entity_id
GROUP BY e.id, e.entity_type, e.data;

-- View all entities with their linked contacts
CREATE OR REPLACE VIEW v_entities_with_contacts AS
SELECT
    e.id,
    e.entity_type,
    e.data,
    json_agg(
        json_build_object(
            'id', lc.id,
            'name', lc.name,
            'role', lc.role,
            'email', lc.email,
            'phone', lc.phone,
            'title', lc.title,
            'isPrimary', lc.is_primary,
            'notes', lc.notes
        )
    ) FILTER (WHERE lc.id IS NOT NULL) as linked_contacts
FROM entities e
LEFT JOIN linked_contacts lc ON e.id = lc.entity_id
GROUP BY e.id, e.entity_type, e.data;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Full text search on entity data
CREATE INDEX idx_entities_data_gin ON entities USING GIN (data);

-- Search on contact names and companies
CREATE INDEX idx_entities_data_name ON entities ((data->>'name'));
CREATE INDEX idx_entities_data_company ON entities ((data->>'company'));

-- ============================================
-- BACKUP & RESTORE COMMANDS (for reference)
-- ============================================

-- To backup your database:
-- pg_dump -h localhost -U your_username -d appio_ai > backup.sql

-- To restore your database:
-- psql -h localhost -U your_username -d appio_ai < backup.sql

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

-- Database schema created successfully!
-- You can now run this script in any PostgreSQL instance (pgAdmin, psql, cloud providers, etc.)
-- The database is fully portable and you own all the data.
