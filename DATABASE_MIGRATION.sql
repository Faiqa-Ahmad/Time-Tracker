-- ============================================
-- Time Tracker Database Migration Script
-- PostgreSQL 14+
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Subscription Details
    plan VARCHAR(50) NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter', 'professional', 'enterprise')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled', 'trial')),
    max_members INTEGER NOT NULL DEFAULT 10,
    
    -- Organization Details
    industry VARCHAR(100),
    company_size VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    logo_url TEXT,
    
    -- Billing Information
    stripe_customer_id VARCHAR(255) UNIQUE,
    
    -- PTO Settings
    default_pto_days INTEGER DEFAULT 15,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_ends_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_stripe ON organizations(stripe_customer_id);
CREATE INDEX idx_org_status ON organizations(status);

-- ============================================
-- 2. USERS TABLE
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP WITH TIME ZONE,
    
    -- Profile Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    
    -- Role & Permissions
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('super_admin', 'admin', 'employee')),
    permissions JSONB DEFAULT '[]',
    
    -- Employment Details
    employee_id VARCHAR(100),
    department VARCHAR(100),
    position VARCHAR(100),
    hourly_rate DECIMAL(10, 2),
    hire_date DATE,
    
    -- PTO Balances
    pto_balance INTEGER DEFAULT 0,
    sick_leave_balance INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'invited')),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_org ON users(organization_id);
CREATE INDEX idx_user_role ON users(role);
CREATE INDEX idx_user_status ON users(status);

-- ============================================
-- 3. SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan_id VARCHAR(50) NOT NULL CHECK (plan_id IN ('starter', 'professional', 'enterprise')),
    billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    
    -- Stripe Integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'trialing')),
    
    -- Pricing
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Billing Periods
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sub_org ON subscriptions(organization_id);
CREATE INDEX idx_sub_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_sub_status ON subscriptions(status);

-- ============================================
-- 4. PROJECTS TABLE
-- ============================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Project Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50),
    color VARCHAR(7) DEFAULT '#3B82F6',
    
    -- Status & Dates
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
    start_date DATE,
    end_date DATE,
    deadline DATE,
    
    -- Budget & Billing
    budget DECIMAL(12, 2),
    hourly_rate DECIMAL(10, 2),
    is_billable BOOLEAN DEFAULT TRUE,
    
    -- Client Information
    client_name VARCHAR(255),
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    
    -- Project Manager
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_project_org ON projects(organization_id);
CREATE INDEX idx_project_status ON projects(status);
CREATE INDEX idx_project_manager ON projects(manager_id);
CREATE INDEX idx_project_created_by ON projects(created_by);

-- ============================================
-- 5. PROJECT MEMBERS TABLE
-- ============================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role on Project
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('manager', 'member', 'viewer')),
    
    -- Billing
    hourly_rate DECIMAL(10, 2),
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE (project_id, user_id)
);

CREATE INDEX idx_pm_project ON project_members(project_id);
CREATE INDEX idx_pm_user ON project_members(user_id);

-- ============================================
-- 6. TIME LOGS TABLE
-- ============================================
CREATE TABLE time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time Details
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    
    -- Work Details
    description TEXT,
    task_name VARCHAR(255),
    tags JSONB DEFAULT '[]',
    
    -- Billing
    is_billable BOOLEAN DEFAULT TRUE,
    hourly_rate DECIMAL(10, 2),
    amount DECIMAL(10, 2),
    
    -- Status
    status VARCHAR(50) DEFAULT 'stopped' CHECK (status IN ('running', 'stopped', 'approved', 'rejected')),
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timelog_user ON time_logs(user_id);
CREATE INDEX idx_timelog_project ON time_logs(project_id);
CREATE INDEX idx_timelog_org ON time_logs(organization_id);
CREATE INDEX idx_timelog_date ON time_logs(DATE(start_time));
CREATE INDEX idx_timelog_status ON time_logs(status);
CREATE INDEX idx_timelog_start ON time_logs(start_time);

-- ============================================
-- 7. TIME OFF TABLE
-- ============================================
CREATE TABLE time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time Off Details
    type VARCHAR(50) NOT NULL CHECK (type IN ('vacation', 'sick', 'personal', 'unpaid', 'holiday')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Request Details
    reason TEXT,
    notes TEXT,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    
    -- Approval
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_timeoff_user ON time_off(user_id);
CREATE INDEX idx_timeoff_org ON time_off(organization_id);
CREATE INDEX idx_timeoff_status ON time_off(status);
CREATE INDEX idx_timeoff_dates ON time_off(start_date, end_date);

-- ============================================
-- 8. AUDIT LOGS TABLE
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    
    -- Change Details
    changes JSONB,
    old_values JSONB,
    new_values JSONB,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_org ON audit_logs(organization_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- 9. INVITATIONS TABLE
-- ============================================
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee' CHECK (role IN ('admin', 'employee')),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    
    -- Invited By
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Acceptance
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_invite_org ON invitations(organization_id);
CREATE INDEX idx_invite_email ON invitations(email);
CREATE INDEX idx_invite_token ON invitations(token);
CREATE INDEX idx_invite_status ON invitations(status);

-- ============================================
-- 10. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Links
    link_url TEXT,
    link_text VARCHAR(100),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notif_user ON notifications(user_id);
CREATE INDEX idx_notif_read ON notifications(is_read);
CREATE INDEX idx_notif_created ON notifications(created_at);
CREATE INDEX idx_notif_type ON notifications(type);

-- ============================================
-- 11. PAYMENTS TABLE
-- ============================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    
    -- Payment Details
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Stripe Details
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    stripe_invoice_id VARCHAR(255),
    stripe_charge_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
    
    -- Payment Method
    payment_method VARCHAR(50),
    last_four VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- Dates
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payment_org ON payments(organization_id);
CREATE INDEX idx_payment_subscription ON payments(subscription_id);
CREATE INDEX idx_payment_stripe_pi ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payment_status ON payments(status);
CREATE INDEX idx_payment_created ON payments(created_at);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_logs_updated_at BEFORE UPDATE ON time_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_off_updated_at BEFORE UPDATE ON time_off
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample organization
INSERT INTO organizations (name, slug, plan, industry, company_size) VALUES
('Acme Corporation', 'acme-corp', 'professional', 'technology', '11-50 employees');

-- Get the organization ID
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'acme-corp';
    
    -- Insert sample admin user (password: 'password123')
    INSERT INTO users (
        organization_id, email, password_hash, first_name, last_name, role, status
    ) VALUES (
        org_id,
        'admin@acme-corp.com',
        '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
        'Admin',
        'User',
        'admin',
        'active'
    );
END $$;

-- ============================================
-- VIEWS (Optional - for common queries)
-- ============================================

-- View: Active users per organization
CREATE OR REPLACE VIEW org_active_users AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    COUNT(u.id) as active_user_count,
    o.max_members,
    o.max_members - COUNT(u.id) as remaining_slots
FROM organizations o
LEFT JOIN users u ON o.id = u.organization_id AND u.status = 'active'
GROUP BY o.id, o.name, o.max_members;

-- View: Time log summary by user
CREATE OR REPLACE VIEW user_time_summary AS
SELECT 
    u.id as user_id,
    u.first_name,
    u.last_name,
    u.organization_id,
    COUNT(tl.id) as total_logs,
    SUM(tl.duration) as total_seconds,
    ROUND(SUM(tl.duration)::NUMERIC / 3600, 2) as total_hours,
    SUM(tl.amount) as total_amount
FROM users u
LEFT JOIN time_logs tl ON u.id = tl.user_id
GROUP BY u.id, u.first_name, u.last_name, u.organization_id;

-- View: Project budget vs actual
CREATE OR REPLACE VIEW project_budget_tracking AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.organization_id,
    p.budget,
    SUM(tl.amount) as total_spent,
    p.budget - COALESCE(SUM(tl.amount), 0) as remaining_budget,
    CASE 
        WHEN p.budget > 0 THEN ROUND((COALESCE(SUM(tl.amount), 0) / p.budget * 100)::NUMERIC, 2)
        ELSE 0
    END as budget_used_percent
FROM projects p
LEFT JOIN time_logs tl ON p.id = tl.project_id
GROUP BY p.id, p.name, p.organization_id, p.budget;

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================

-- Example: Grant permissions to application user
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
