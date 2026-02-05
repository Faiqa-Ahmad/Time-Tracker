# 🏗️ Backend Integration Documentation

## Table of Contents
1. [Database Schema & ER Diagram](#database-schema--er-diagram)
2. [API Endpoints](#api-endpoints)
3. [Required API Keys & Integrations](#required-api-keys--integrations)
4. [Authentication & Authorization](#authentication--authorization)
5. [Webhook Handlers](#webhook-handlers)
6. [Environment Variables](#environment-variables)

---

## Database Schema & ER Diagram

### 📊 ER Diagram Overview

```
┌─────────────────┐
│  Organizations  │
│                 │
│  - id           │◄────┐
│  - name         │     │
│  - slug         │     │
│  - plan         │     │
│  - status       │     │
│  - max_members  │     │
└─────────────────┘     │
         │              │
         │              │
         ▼              │
┌─────────────────┐     │
│     Users       │     │
│                 │     │
│  - id           │     │
│  - org_id       │─────┘
│  - email        │
│  - password     │
│  - role         │
│  - first_name   │
│  - last_name    │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│    Projects     │────▶│  ProjectMembers  │
│                 │     │                  │
│  - id           │     │  - project_id    │
│  - org_id       │     │  - user_id       │
│  - name         │     │  - role          │
│  - description  │     └──────────────────┘
│  - status       │
└─────────────────┘
         │
         │
         ▼
┌─────────────────┐
│    TimeLogs     │
│                 │
│  - id           │
│  - user_id      │
│  - project_id   │
│  - start_time   │
│  - end_time     │
│  - duration     │
│  - description  │
└─────────────────┘

┌─────────────────┐
│ Subscriptions   │
│                 │
│  - id           │
│  - org_id       │
│  - plan_id      │
│  - status       │
│  - stripe_sub   │
│  - current_end  │
└─────────────────┘

┌─────────────────┐
│   TimeOff       │
│                 │
│  - id           │
│  - user_id      │
│  - type         │
│  - start_date   │
│  - end_date     │
│  - status       │
│  - reason       │
└─────────────────┘

┌─────────────────┐
│   AuditLogs     │
│                 │
│  - id           │
│  - org_id       │
│  - user_id      │
│  - action       │
│  - entity_type  │
│  - timestamp    │
└─────────────────┘
```

---

## 📋 Detailed Table Schemas

### 1. **organizations** Table

```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    
    -- Subscription Details
    plan VARCHAR(50) NOT NULL DEFAULT 'starter',
        -- Values: 'starter' | 'professional' | 'enterprise'
    status VARCHAR(50) NOT NULL DEFAULT 'active',
        -- Values: 'active' | 'suspended' | 'cancelled' | 'trial'
    max_members INTEGER NOT NULL DEFAULT 10,
    
    -- Organization Details
    industry VARCHAR(100),
    company_size VARCHAR(50),
    address TEXT,
    phone VARCHAR(50),
    
    -- Billing Information
    stripe_customer_id VARCHAR(255) UNIQUE,
    
    -- PTO Settings
    default_pto_days INTEGER DEFAULT 15,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    trial_ends_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_org_slug (slug),
    INDEX idx_org_stripe (stripe_customer_id)
);
```

**Relationships:**
- Has many: Users, Projects, Subscriptions, AuditLogs
- Has one: Subscription (current)

---

### 2. **users** Table

```sql
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
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
        -- Values: 'super_admin' | 'admin' | 'employee'
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
    status VARCHAR(50) NOT NULL DEFAULT 'active',
        -- Values: 'active' | 'inactive' | 'suspended' | 'invited'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE,
    invited_at TIMESTAMP WITH TIME ZONE,
    
    -- Indexes
    INDEX idx_user_email (email),
    INDEX idx_user_org (organization_id),
    INDEX idx_user_role (role),
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);
```

**Relationships:**
- Belongs to: Organization
- Has many: TimeLogs, TimeOff, ProjectMembers
- Has many: AuditLogs (as actor)

---

### 3. **subscriptions** Table

```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Plan Details
    plan_id VARCHAR(50) NOT NULL,
        -- Values: 'starter' | 'professional' | 'enterprise'
    billing_cycle VARCHAR(50) NOT NULL,
        -- Values: 'monthly' | 'yearly'
    
    -- Stripe Integration
    stripe_subscription_id VARCHAR(255) UNIQUE,
    stripe_customer_id VARCHAR(255),
    stripe_price_id VARCHAR(255),
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'active',
        -- Values: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing'
    
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_sub_org (organization_id),
    INDEX idx_sub_stripe (stripe_subscription_id),
    INDEX idx_sub_status (status)
);
```

**Relationships:**
- Belongs to: Organization

---

### 4. **projects** Table

```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Project Details
    name VARCHAR(255) NOT NULL,
    description TEXT,
    code VARCHAR(50),
    
    -- Status & Dates
    status VARCHAR(50) NOT NULL DEFAULT 'active',
        -- Values: 'active' | 'on_hold' | 'completed' | 'cancelled'
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
    
    -- Project Manager
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    -- Indexes
    INDEX idx_project_org (organization_id),
    INDEX idx_project_status (status),
    INDEX idx_project_manager (manager_id)
);
```

**Relationships:**
- Belongs to: Organization
- Has many: ProjectMembers, TimeLogs
- Belongs to: User (manager)

---

### 5. **project_members** Table

```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role on Project
    role VARCHAR(50) DEFAULT 'member',
        -- Values: 'manager' | 'member' | 'viewer'
    
    -- Billing
    hourly_rate DECIMAL(10, 2),
    
    -- Timestamps
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_pm_project (project_id),
    INDEX idx_pm_user (user_id),
    
    -- Constraints
    UNIQUE (project_id, user_id)
);
```

**Relationships:**
- Belongs to: Project, User

---

### 6. **time_logs** Table

```sql
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
    status VARCHAR(50) DEFAULT 'stopped',
        -- Values: 'running' | 'stopped' | 'approved' | 'rejected'
    
    -- Approval
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_timelog_user (user_id),
    INDEX idx_timelog_project (project_id),
    INDEX idx_timelog_org (organization_id),
    INDEX idx_timelog_date (DATE(start_time)),
    INDEX idx_timelog_status (status)
);
```

**Relationships:**
- Belongs to: User, Project, Organization

---

### 7. **time_off** Table

```sql
CREATE TABLE time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Time Off Details
    type VARCHAR(50) NOT NULL,
        -- Values: 'vacation' | 'sick' | 'personal' | 'unpaid' | 'holiday'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    
    -- Request Details
    reason TEXT,
    notes TEXT,
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
        -- Values: 'pending' | 'approved' | 'rejected' | 'cancelled'
    
    -- Approval
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_timeoff_user (user_id),
    INDEX idx_timeoff_org (organization_id),
    INDEX idx_timeoff_status (status),
    INDEX idx_timeoff_dates (start_date, end_date)
);
```

**Relationships:**
- Belongs to: User, Organization

---

### 8. **audit_logs** Table

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL,
        -- Examples: 'user.created', 'project.updated', 'timelog.deleted'
    entity_type VARCHAR(50) NOT NULL,
        -- Values: 'user' | 'project' | 'timelog' | 'organization' | 'subscription'
    entity_id UUID,
    
    -- Change Details
    changes JSONB,
    old_values JSONB,
    new_values JSONB,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_audit_org (organization_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_action (action),
    INDEX idx_audit_created (created_at)
);
```

**Relationships:**
- Belongs to: Organization, User

---

### 9. **invitations** Table

```sql
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'employee',
    
    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
        -- Values: 'pending' | 'accepted' | 'expired' | 'revoked'
    
    -- Invited By
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Acceptance
    accepted_at TIMESTAMP WITH TIME ZONE,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_invite_org (organization_id),
    INDEX idx_invite_email (email),
    INDEX idx_invite_token (token),
    INDEX idx_invite_status (status)
);
```

**Relationships:**
- Belongs to: Organization

---

### 10. **notifications** Table

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type VARCHAR(50) NOT NULL,
        -- Values: 'timeoff_approved' | 'timeoff_rejected' | 'project_assigned' | 'payment_failed'
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_notif_user (user_id),
    INDEX idx_notif_read (is_read),
    INDEX idx_notif_created (created_at)
);
```

**Relationships:**
- Belongs to: User

---

### 11. **payments** Table

```sql
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
    
    -- Status
    status VARCHAR(50) NOT NULL,
        -- Values: 'pending' | 'succeeded' | 'failed' | 'refunded'
    
    -- Payment Method
    payment_method VARCHAR(50),
        -- Values: 'card' | 'ach' | 'wire'
    last_four VARCHAR(4),
    
    -- Dates
    paid_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    INDEX idx_payment_org (organization_id),
    INDEX idx_payment_stripe (stripe_payment_intent_id),
    INDEX idx_payment_status (status)
);
```

**Relationships:**
- Belongs to: Organization, Subscription

---

## 🔌 API Endpoints

### Authentication Endpoints

#### **POST** `/api/auth/signup`
Create new user account with organization (after payment).

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@company.com",
  "password": "secure_password",
  "organization": {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "industry": "technology",
    "companySize": "11-50 employees"
  },
  "planId": "professional",
  "billingCycle": "monthly",
  "stripePaymentIntentId": "pi_xxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "organizationId": "uuid",
    "email": "john@company.com"
  },
  "message": "Account created successfully"
}
```

---

#### **POST** `/api/auth/login`
User login.

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "john@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "admin",
      "organizationId": "uuid"
    },
    "organization": {
      "id": "uuid",
      "name": "Acme Corp",
      "slug": "acme-corp",
      "plan": "professional"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

#### **POST** `/api/auth/refresh`
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

---

#### **POST** `/api/auth/logout`
Logout user.

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/auth/forgot-password`
Request password reset.

**Request Body:**
```json
{
  "email": "john@company.com"
}
```

---

#### **POST** `/api/auth/reset-password`
Reset password with token.

**Request Body:**
```json
{
  "token": "reset_token",
  "newPassword": "new_secure_password"
}
```

---

### Organization Endpoints

#### **GET** `/api/organizations/:id`
Get organization details.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Acme Corp",
    "slug": "acme-corp",
    "plan": "professional",
    "status": "active",
    "maxMembers": 50,
    "currentMembers": 12,
    "industry": "technology",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

#### **PATCH** `/api/organizations/:id`
Update organization details.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "New Name",
  "industry": "finance",
  "address": "123 Main St"
}
```

---

#### **GET** `/api/organizations/:id/members`
Get organization members.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `role` (optional: filter by role)
- `status` (optional: filter by status)

**Response:**
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "uuid",
        "email": "john@company.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "admin",
        "status": "active",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

---

### User Endpoints

#### **GET** `/api/users/me`
Get current user profile.

**Headers:** `Authorization: Bearer {token}`

---

#### **PATCH** `/api/users/me`
Update current user profile.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

---

#### **POST** `/api/users`
Create new user (Admin only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "email": "employee@company.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "employee",
  "department": "Engineering",
  "position": "Developer",
  "hourlyRate": 50.00
}
```

---

#### **PATCH** `/api/users/:id`
Update user (Admin only).

**Headers:** `Authorization: Bearer {token}`

---

#### **DELETE** `/api/users/:id`
Delete user (Admin only).

**Headers:** `Authorization: Bearer {token}`

---

### Project Endpoints

#### **GET** `/api/projects`
Get all projects.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `status` (optional)
- `search` (optional)

---

#### **POST** `/api/projects`
Create new project.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "name": "Website Redesign",
  "description": "Redesign company website",
  "status": "active",
  "budget": 50000,
  "hourlyRate": 100,
  "isBillable": true,
  "clientName": "Client Corp",
  "managerId": "uuid"
}
```

---

#### **GET** `/api/projects/:id`
Get project details.

**Headers:** `Authorization: Bearer {token}`

---

#### **PATCH** `/api/projects/:id`
Update project.

**Headers:** `Authorization: Bearer {token}`

---

#### **DELETE** `/api/projects/:id`
Delete project.

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/projects/:id/members`
Add member to project.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "userId": "uuid",
  "role": "member",
  "hourlyRate": 75.00
}
```

---

#### **DELETE** `/api/projects/:id/members/:userId`
Remove member from project.

**Headers:** `Authorization: Bearer {token}`

---

### Time Log Endpoints

#### **GET** `/api/time-logs`
Get time logs.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `userId` (optional)
- `projectId` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `status` (optional)
- `page` (default: 1)
- `limit` (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "timeLogs": [
      {
        "id": "uuid",
        "userId": "uuid",
        "projectId": "uuid",
        "startTime": "2024-01-01T09:00:00Z",
        "endTime": "2024-01-01T17:00:00Z",
        "duration": 28800,
        "description": "Working on feature X",
        "status": "stopped",
        "isBillable": true,
        "amount": 400.00
      }
    ],
    "summary": {
      "totalHours": 120.5,
      "totalAmount": 12050.00
    }
  }
}
```

---

#### **POST** `/api/time-logs`
Create time log.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "projectId": "uuid",
  "startTime": "2024-01-01T09:00:00Z",
  "description": "Working on feature X",
  "taskName": "Feature Development"
}
```

---

#### **POST** `/api/time-logs/:id/stop`
Stop running time log.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "endTime": "2024-01-01T17:00:00Z"
}
```

---

#### **PATCH** `/api/time-logs/:id`
Update time log.

**Headers:** `Authorization: Bearer {token}`

---

#### **DELETE** `/api/time-logs/:id`
Delete time log.

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/time-logs/:id/approve`
Approve time log (Admin only).

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/time-logs/:id/reject`
Reject time log (Admin only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Invalid project code"
}
```

---

### Time Off Endpoints

#### **GET** `/api/time-off`
Get time off requests.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `userId` (optional)
- `status` (optional)
- `type` (optional)
- `startDate` (optional)
- `endDate` (optional)

---

#### **POST** `/api/time-off`
Create time off request.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "type": "vacation",
  "startDate": "2024-12-20",
  "endDate": "2024-12-27",
  "reason": "Family vacation"
}
```

---

#### **PATCH** `/api/time-off/:id`
Update time off request.

**Headers:** `Authorization: Bearer {token}`

---

#### **DELETE** `/api/time-off/:id`
Cancel time off request.

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/time-off/:id/approve`
Approve time off (Admin only).

**Headers:** `Authorization: Bearer {token}`

---

#### **POST** `/api/time-off/:id/reject`
Reject time off (Admin only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reason": "Insufficient PTO balance"
}
```

---

### Subscription & Billing Endpoints

#### **GET** `/api/subscriptions/:organizationId`
Get current subscription.

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "planId": "professional",
    "billingCycle": "monthly",
    "status": "active",
    "amount": 79.00,
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z"
  }
}
```

---

#### **POST** `/api/subscriptions/create-checkout-session`
Create Stripe checkout session for new subscription.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "planId": "professional",
  "billingCycle": "monthly",
  "organizationName": "Acme Corp",
  "email": "john@company.com"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_xxx",
    "url": "https://checkout.stripe.com/xxx"
  }
}
```

---

#### **POST** `/api/subscriptions/:id/upgrade`
Upgrade subscription plan.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "newPlanId": "enterprise",
  "billingCycle": "yearly"
}
```

---

#### **POST** `/api/subscriptions/:id/cancel`
Cancel subscription.

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "cancelAtPeriodEnd": true,
  "reason": "Too expensive"
}
```

---

#### **GET** `/api/payments`
Get payment history.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)

---

### Reports Endpoints

#### **GET** `/api/reports/time-summary`
Get time summary report.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `startDate` (required)
- `endDate` (required)
- `userId` (optional)
- `projectId` (optional)
- `groupBy` (optional: 'user' | 'project' | 'date')

**Response:**
```json
{
  "success": true,
  "data": {
    "totalHours": 320.5,
    "billableHours": 280.0,
    "nonBillableHours": 40.5,
    "totalAmount": 28000.00,
    "breakdown": [
      {
        "projectName": "Website Redesign",
        "hours": 120.5,
        "amount": 12050.00
      }
    ]
  }
}
```

---

#### **GET** `/api/reports/user-activity`
Get user activity report.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `startDate` (required)
- `endDate` (required)
- `userId` (optional)

---

#### **GET** `/api/reports/project-overview`
Get project overview report.

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `projectId` (required)
- `startDate` (optional)
- `endDate` (optional)

---

### Audit Log Endpoints

#### **GET** `/api/audit-logs`
Get audit logs (Admin only).

**Headers:** `Authorization: Bearer {token}`

**Query Params:**
- `userId` (optional)
- `action` (optional)
- `entityType` (optional)
- `startDate` (optional)
- `endDate` (optional)
- `page` (default: 1)
- `limit` (default: 50)

---

### Invitation Endpoints

#### **POST** `/api/invitations`
Send invitation (Admin only).

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "email": "newuser@company.com",
  "role": "employee"
}
```

---

#### **GET** `/api/invitations/:token`
Get invitation details (public).

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "newuser@company.com",
    "organizationName": "Acme Corp",
    "role": "employee",
    "expiresAt": "2024-02-01T00:00:00Z"
  }
}
```

---

#### **POST** `/api/invitations/:token/accept`
Accept invitation (public).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "secure_password"
}
```

---

## 🔑 Required API Keys & Integrations

### 1. **Stripe** (Payment Processing) - REQUIRED

**Purpose:** Handle subscription payments, billing, invoices

**API Keys Needed:**
```env
STRIPE_PUBLISHABLE_KEY=pk_live_xxx  # Frontend
STRIPE_SECRET_KEY=sk_live_xxx       # Backend
STRIPE_WEBHOOK_SECRET=whsec_xxx     # Webhook verification
```

**Plans Setup in Stripe:**
- Create 3 products: Starter, Professional, Enterprise
- Create 6 prices: 3 monthly + 3 yearly
- Note down price IDs

**Resources:**
- Documentation: https://stripe.com/docs/api
- Dashboard: https://dashboard.stripe.com
- Pricing: 2.9% + $0.30 per transaction

---

### 2. **SendGrid** or **AWS SES** (Email Service) - REQUIRED

**Purpose:** Send emails (verification, password reset, notifications, invoices)

**Option A - SendGrid:**
```env
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Roburna Tracker
```

**Email Templates Needed:**
1. Welcome email
2. Email verification
3. Password reset
4. Invitation to join organization
5. Time off request notifications
6. Payment receipts
7. Subscription renewal reminders

**Resources:**
- Documentation: https://docs.sendgrid.com
- Pricing: Free tier (100 emails/day), Paid ($19.95/mo for 50k emails)

**Option B - AWS SES:**
```env
AWS_SES_REGION=us-east-1
AWS_SES_ACCESS_KEY_ID=xxx
AWS_SES_SECRET_ACCESS_KEY=xxx
AWS_SES_FROM_EMAIL=noreply@yourdomain.com
```

**Resources:**
- Documentation: https://docs.aws.amazon.com/ses
- Pricing: $0.10 per 1,000 emails

---

### 3. **PostgreSQL Database** - REQUIRED

**Purpose:** Primary database

**Options:**

**Option A - Supabase (Recommended):**
```env
DATABASE_URL=postgresql://postgres:[password]@db.xxx.supabase.co:5432/postgres
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_KEY=eyJxxx
```

**Resources:**
- Dashboard: https://supabase.com
- Pricing: Free tier (500MB), Pro ($25/mo)

**Option B - AWS RDS:**
```env
DATABASE_URL=postgresql://username:password@endpoint.rds.amazonaws.com:5432/dbname
```

**Option C - Heroku Postgres:**
```env
DATABASE_URL=postgres://xxx@ec2-xxx.compute-1.amazonaws.com:5432/xxx
```

---

### 4. **Redis** (Caching & Session Storage) - REQUIRED

**Purpose:** Session management, rate limiting, caching

```env
REDIS_URL=redis://default:password@hostname:6379
```

**Options:**
- **Upstash Redis** (Serverless): Free tier available
- **Redis Cloud**: Free tier (30MB)
- **AWS ElastiCache**: Paid

**Resources:**
- Upstash: https://upstash.com (Recommended for easy setup)

---

### 5. **AWS S3** or **Cloudinary** (File Storage) - OPTIONAL

**Purpose:** Store user avatars, organization logos, file attachments

**Option A - AWS S3:**
```env
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACCESS_KEY_ID=xxx
AWS_S3_SECRET_ACCESS_KEY=xxx
```

**Option B - Cloudinary:**
```env
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

**Resources:**
- AWS S3: https://aws.amazon.com/s3 ($0.023/GB/month)
- Cloudinary: https://cloudinary.com (Free tier: 25GB)

---

### 6. **JWT Secret** - REQUIRED

**Purpose:** Sign and verify authentication tokens

```env
JWT_SECRET=your-super-secret-key-here-min-32-chars
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d
```

**Generate secure secrets:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### 7. **Google OAuth** (Optional)

**Purpose:** Allow "Sign in with Google"

```env
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

**Setup:**
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs

---

### 8. **Sentry** (Error Tracking) - OPTIONAL but RECOMMENDED

**Purpose:** Monitor errors and performance

```env
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production
```

**Resources:**
- Dashboard: https://sentry.io
- Pricing: Free tier (5k events/month)

---

### 9. **Twilio** (SMS Notifications) - OPTIONAL

**Purpose:** Send SMS notifications for critical alerts

```env
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Resources:**
- Dashboard: https://www.twilio.com
- Pricing: Pay-as-you-go ($0.0075/SMS)

---

## 🔐 Authentication & Authorization

### JWT Token Structure

**Access Token Payload:**
```json
{
  "userId": "uuid",
  "email": "john@company.com",
  "organizationId": "uuid",
  "role": "admin",
  "iat": 1609459200,
  "exp": 1609545600
}
```

**Refresh Token Payload:**
```json
{
  "userId": "uuid",
  "type": "refresh",
  "iat": 1609459200,
  "exp": 1610064000
}
```

---

### Role-Based Permissions

**Super Admin:**
- Manage all organizations
- View global analytics
- Access system settings
- Manage billing for all orgs

**Admin:**
- Manage organization settings
- Create/edit/delete users
- Approve time logs
- Approve time off requests
- View all reports
- Manage projects
- Manage subscriptions

**Employee:**
- Track own time
- View own time logs
- Submit time off requests
- View assigned projects
- View own reports

---

### Protected Route Middleware Example

```javascript
// Verify JWT and attach user to request
async function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await getUserById(decoded.userId);
    req.organizationId = decoded.organizationId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

// Check if user has required role
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Usage
app.delete('/api/users/:id', authenticateToken, requireRole('admin'), deleteUser);
```

---

## 🪝 Webhook Handlers

### Stripe Webhooks

**Endpoint:** `POST /api/webhooks/stripe`

**Events to Handle:**

1. **checkout.session.completed**
   - Create user account
   - Create organization
   - Create subscription record
   - Send welcome email

2. **customer.subscription.created**
   - Update subscription status
   - Update organization plan

3. **customer.subscription.updated**
   - Update subscription status
   - Handle plan changes

4. **customer.subscription.deleted**
   - Cancel subscription
   - Suspend organization access

5. **invoice.payment_succeeded**
   - Create payment record
   - Send receipt email
   - Extend subscription period

6. **invoice.payment_failed**
   - Update subscription status to 'past_due'
   - Send payment failure email
   - Notify admin

**Example Handler:**
```javascript
app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
    }
    
    res.json({ received: true });
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

## 🌍 Environment Variables

### Complete .env File Template

```env
# App Configuration
NODE_ENV=production
PORT=5000
APP_URL=https://yourdomain.com
FRONTEND_URL=https://app.yourdomain.com

# Database
DATABASE_URL=postgresql://username:password@host:5432/dbname
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://default:password@hostname:6379

# JWT
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-super-secret-key
REFRESH_TOKEN_EXPIRES_IN=7d

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Stripe Price IDs
STRIPE_PRICE_STARTER_MONTHLY=price_xxx
STRIPE_PRICE_STARTER_YEARLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_MONTHLY=price_xxx
STRIPE_PRICE_PROFESSIONAL_YEARLY=price_xxx
STRIPE_PRICE_ENTERPRISE_MONTHLY=price_xxx
STRIPE_PRICE_ENTERPRISE_YEARLY=price_xxx

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Roburna Tracker

# OR Email (AWS SES)
# AWS_SES_REGION=us-east-1
# AWS_SES_ACCESS_KEY_ID=xxx
# AWS_SES_SECRET_ACCESS_KEY=xxx
# AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# File Storage (Optional)
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_S3_ACCESS_KEY_ID=xxx
AWS_S3_SECRET_ACCESS_KEY=xxx

# OR Cloudinary
# CLOUDINARY_CLOUD_NAME=xxx
# CLOUDINARY_API_KEY=xxx
# CLOUDINARY_API_SECRET=xxx

# OAuth (Optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback

# Error Tracking (Optional)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
SENTRY_ENVIRONMENT=production

# SMS (Optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cors
CORS_ORIGIN=https://app.yourdomain.com

# Session
SESSION_SECRET=another-secret-key-for-sessions
```

---

## 📦 Recommended Backend Stack

```
┌─────────────────────────────────────┐
│         Frontend (Next.js)          │
│     https://app.yourdomain.com      │
└──────────────┬──────────────────────┘
               │
               │ REST API / GraphQL
               ▼
┌─────────────────────────────────────┐
│      Backend API (Node.js)          │
│                                     │
│  Framework Options:                 │
│  - Express.js (Simple)              │
│  - NestJS (Enterprise, Recommended) │
│  - Fastify (Performance)            │
└──────────────┬──────────────────────┘
               │
         ┌─────┴─────┬─────────┐
         ▼           ▼         ▼
┌──────────────┐ ┌────────┐ ┌────────┐
│  PostgreSQL  │ │  Redis │ │   S3   │
│   (Supabase) │ │(Upstash│ │(Storage│
└──────────────┘ └────────┘ └────────┘
```

**Recommended:**
- **Backend Framework:** NestJS (TypeScript, scalable)
- **ORM:** Prisma or TypeORM
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Cache:** Upstash Redis (Serverless)
- **Email:** SendGrid (Easy setup)
- **Payments:** Stripe (Best documentation)
- **Hosting:** Vercel (Backend) + Vercel (Frontend)

---

## 🚀 API Cost Estimate (Monthly)

**Minimum (Starter - 100 users):**
- Supabase Pro: $25
- Upstash Redis: Free
- SendGrid: Free tier
- Stripe: 2.9% per transaction
- **Total: ~$25/month + transaction fees**

**Growing (Professional - 1000 users):**
- Supabase Pro: $25
- Upstash Redis: $10
- SendGrid Essentials: $19.95
- AWS S3: $5
- Sentry: Free tier
- **Total: ~$60/month + transaction fees**

**Enterprise (10,000+ users):**
- AWS RDS: $200+
- AWS ElastiCache: $50+
- SendGrid Pro: $89.95
- AWS S3: $20
- Sentry Team: $26
- **Total: ~$400/month + transaction fees**

---

## ✅ Quick Start Checklist

### Phase 1: Setup (Week 1)
- [ ] Set up PostgreSQL database (Supabase recommended)
- [ ] Create all tables from schema
- [ ] Set up Redis (Upstash)
- [ ] Create Stripe account and products
- [ ] Set up SendGrid/SES for emails
- [ ] Configure environment variables

### Phase 2: Core APIs (Week 2-3)
- [ ] Implement authentication (signup, login, JWT)
- [ ] Implement organization CRUD
- [ ] Implement user CRUD
- [ ] Implement project CRUD
- [ ] Implement time log CRUD

### Phase 3: Advanced Features (Week 4-5)
- [ ] Implement time off management
- [ ] Implement reports
- [ ] Implement audit logs
- [ ] Implement notifications
- [ ] Implement invitations

### Phase 4: Billing (Week 6)
- [ ] Integrate Stripe checkout
- [ ] Implement subscription webhooks
- [ ] Implement plan upgrades/downgrades
- [ ] Implement payment history

### Phase 5: Testing & Deployment (Week 7-8)
- [ ] Write API tests
- [ ] Set up error tracking (Sentry)
- [ ] Deploy backend to production
- [ ] Configure webhooks
- [ ] Test end-to-end flow

---

## 📞 Support & Resources

**Documentation References:**
- Stripe API: https://stripe.com/docs/api
- Supabase: https://supabase.com/docs
- SendGrid: https://docs.sendgrid.com
- PostgreSQL: https://www.postgresql.org/docs

**Need Help?**
- Backend questions: Review this documentation
- API design: Follow REST best practices
- Security: Use HTTPS, hash passwords, validate inputs
- Performance: Implement caching, pagination, indexes

---

**Status:** ✅ Ready for Backend Implementation  
**Last Updated:** Feb 3, 2026  
**Version:** 1.0
