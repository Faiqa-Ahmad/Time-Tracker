# 🚀 Backend Quick Start Guide

Complete checklist to get your Time Tracker backend up and running.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **BACKEND_DOCUMENTATION.md** | Complete API specs, tables, endpoints, integrations |
| **DATABASE_MIGRATION.sql** | SQL script to create all tables |
| **ER_DIAGRAM.md** | Visual database relationships |
| **BACKEND_IMPLEMENTATION_GUIDE.md** | Code examples, controllers, middleware |
| **BACKEND_QUICK_START.md** | This file - step-by-step setup |

---

## ✅ Step-by-Step Setup

### Phase 1: Account Setup (Day 1)

#### 1.1 Create Supabase Account
```bash
# Go to: https://supabase.com
# Click "Start your project"
# Create new project
# Copy these from Settings → Database:
- DATABASE_URL
- SUPABASE_URL  
- SUPABASE_ANON_KEY
```

#### 1.2 Create Stripe Account
```bash
# Go to: https://dashboard.stripe.com/register
# Complete verification
# Go to Developers → API keys
# Copy:
- STRIPE_PUBLISHABLE_KEY (pk_test_xxx)
- STRIPE_SECRET_KEY (sk_test_xxx)

# Create Products:
1. Starter Plan
   - Monthly: $29/month → Copy price ID
   - Yearly: $290/year → Copy price ID
2. Professional Plan  
   - Monthly: $79/month → Copy price ID
   - Yearly: $790/year → Copy price ID
3. Enterprise Plan
   - Monthly: $199/month → Copy price ID
   - Yearly: $1990/year → Copy price ID

# Setup Webhook:
# Go to Developers → Webhooks → Add endpoint
# URL: https://your-api.com/api/webhooks/stripe
# Events: Select all invoice and subscription events
# Copy STRIPE_WEBHOOK_SECRET
```

#### 1.3 Create SendGrid Account
```bash
# Go to: https://signup.sendgrid.com
# Verify email
# Go to Settings → API Keys → Create API Key
# Copy: SENDGRID_API_KEY

# Verify Sender:
# Settings → Sender Authentication → Verify Single Sender
# Use: noreply@yourdomain.com
```

#### 1.4 Create Redis (Upstash)
```bash
# Go to: https://upstash.com
# Create database
# Copy: REDIS_URL
```

---

### Phase 2: Database Setup (Day 1-2)

#### 2.1 Run Migration Script
```bash
# Open Supabase Dashboard → SQL Editor
# Copy entire content from DATABASE_MIGRATION.sql
# Click "Run"
# Verify all 11 tables created

# Or using psql:
psql $DATABASE_URL -f DATABASE_MIGRATION.sql
```

#### 2.2 Verify Tables
```sql
-- Run in SQL Editor:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show:
-- audit_logs
-- invitations
-- notifications
-- organizations
-- payments
-- project_members
-- projects
-- subscriptions
-- time_logs
-- time_off
-- users
```

---

### Phase 3: Backend Project Setup (Day 2-3)

#### 3.1 Initialize Project
```bash
mkdir time-tracker-api
cd time-tracker-api
npm init -y

# Install dependencies
npm install express cors dotenv
npm install jsonwebtoken bcrypt
npm install pg prisma @prisma/client
npm install stripe
npm install @sendgrid/mail
npm install redis
npm install zod

# Dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/jsonwebtoken @types/bcrypt
npm install -D nodemon ts-node
npm install -D prisma
```

#### 3.2 Setup Prisma
```bash
npx prisma init

# Copy schema from BACKEND_IMPLEMENTATION_GUIDE.md
# to prisma/schema.prisma

npx prisma generate
```

#### 3.3 Create .env File
```env
# Copy from BACKEND_DOCUMENTATION.md - Environment Variables section
# Fill in your actual API keys

NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=<generate using: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG...
```

#### 3.4 Create Project Structure
```bash
mkdir -p src/{config,controllers,middleware,routes,services,utils,types}
mkdir -p tests
```

---

### Phase 4: Implementation (Week 1-6)

#### Week 1: Authentication ✅
```bash
# Create files:
- src/config/database.ts
- src/middleware/auth.middleware.ts
- src/controllers/auth.controller.ts
- src/routes/auth.routes.ts
- src/utils/jwt.utils.ts
- src/utils/password.utils.ts

# Test endpoints:
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/refresh
```

#### Week 2: Users & Organizations ✅
```bash
# Create files:
- src/controllers/users.controller.ts
- src/controllers/organizations.controller.ts
- src/routes/users.routes.ts
- src/routes/organizations.routes.ts

# Test endpoints:
GET /api/users/me
PATCH /api/users/:id
GET /api/organizations/:id
PATCH /api/organizations/:id
```

#### Week 3: Projects ✅
```bash
# Create files:
- src/controllers/projects.controller.ts
- src/routes/projects.routes.ts

# Test endpoints:
GET /api/projects
POST /api/projects
PATCH /api/projects/:id
POST /api/projects/:id/members
```

#### Week 4: Time Tracking ✅
```bash
# Create files:
- src/controllers/timeLogs.controller.ts
- src/routes/timeLogs.routes.ts

# Test endpoints:
POST /api/time-logs (start timer)
POST /api/time-logs/:id/stop
GET /api/time-logs
PATCH /api/time-logs/:id
```

#### Week 5: Time Off & Reports ✅
```bash
# Create files:
- src/controllers/timeOff.controller.ts
- src/controllers/reports.controller.ts
- src/routes/timeOff.routes.ts
- src/routes/reports.routes.ts

# Test endpoints:
POST /api/time-off
POST /api/time-off/:id/approve
GET /api/reports/time-summary
```

#### Week 6: Subscriptions & Billing ✅
```bash
# Create files:
- src/config/stripe.ts
- src/controllers/subscriptions.controller.ts
- src/controllers/webhooks.controller.ts
- src/routes/subscriptions.routes.ts
- src/services/stripe.service.ts

# Test endpoints:
POST /api/subscriptions/create-checkout-session
POST /api/webhooks/stripe (Stripe webhook)
POST /api/subscriptions/:id/upgrade
```

---

### Phase 5: Testing (Week 7)

#### 5.1 Write Tests
```bash
npm install -D jest ts-jest @types/jest supertest @types/supertest

# Create test files:
- tests/auth.test.ts
- tests/users.test.ts
- tests/projects.test.ts
- tests/timeLogs.test.ts
```

#### 5.2 Run Tests
```bash
npm test
npm run test:watch
```

---

### Phase 6: Deployment (Week 8)

#### 6.1 Deploy to Vercel (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Settings → Environment Variables
# Copy all from .env
```

#### 6.2 Configure Stripe Webhook
```bash
# Update webhook URL in Stripe Dashboard:
https://your-api.vercel.app/api/webhooks/stripe

# Test webhook:
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

#### 6.3 Update Frontend
```bash
# Update frontend .env:
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

---

## 🧪 Testing Checklist

### Manual Testing

#### Authentication Flow
- [ ] Sign up new account
- [ ] Receive welcome email
- [ ] Login with correct password
- [ ] Login fails with wrong password
- [ ] Refresh token works
- [ ] Logout works

#### Organization Flow
- [ ] Create organization during signup
- [ ] View organization details
- [ ] Update organization settings
- [ ] Invite member to organization

#### Time Tracking Flow
- [ ] Start timer
- [ ] Stop timer (calculates duration)
- [ ] Edit time log
- [ ] Delete time log
- [ ] Admin approve time log
- [ ] View time reports

#### Subscription Flow
- [ ] Select plan during signup
- [ ] Payment processes successfully
- [ ] Subscription created in database
- [ ] Upgrade plan
- [ ] Downgrade plan
- [ ] Cancel subscription
- [ ] Receive payment failed email

---

## 📊 API Endpoint Summary

### Auth Endpoints (6)
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### User Endpoints (5)
```
GET    /api/users/me
PATCH  /api/users/me
GET    /api/users/:id
POST   /api/users
DELETE /api/users/:id
```

### Organization Endpoints (3)
```
GET    /api/organizations/:id
PATCH  /api/organizations/:id
GET    /api/organizations/:id/members
```

### Project Endpoints (7)
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

### Time Log Endpoints (7)
```
GET    /api/time-logs
POST   /api/time-logs
GET    /api/time-logs/:id
PATCH  /api/time-logs/:id
DELETE /api/time-logs/:id
POST   /api/time-logs/:id/stop
POST   /api/time-logs/:id/approve
```

### Time Off Endpoints (6)
```
GET    /api/time-off
POST   /api/time-off
GET    /api/time-off/:id
PATCH  /api/time-off/:id
POST   /api/time-off/:id/approve
POST   /api/time-off/:id/reject
```

### Subscription Endpoints (4)
```
GET    /api/subscriptions/:orgId
POST   /api/subscriptions/create-checkout-session
POST   /api/subscriptions/:id/upgrade
POST   /api/subscriptions/:id/cancel
```

### Report Endpoints (3)
```
GET    /api/reports/time-summary
GET    /api/reports/user-activity
GET    /api/reports/project-overview
```

### Webhook Endpoints (1)
```
POST   /api/webhooks/stripe
```

**Total: ~42 endpoints**

---

## 💰 Cost Breakdown

### Development (Test Mode)
| Service | Cost |
|---------|------|
| Supabase | Free tier |
| Stripe | Free (test mode) |
| SendGrid | Free tier (100/day) |
| Upstash Redis | Free tier |
| **Total** | **$0/month** |

### Production (First 100 users)
| Service | Cost |
|---------|------|
| Supabase Pro | $25/month |
| Stripe | 2.9% + $0.30/transaction |
| SendGrid | Free tier |
| Upstash Redis | Free tier |
| Vercel Pro | $20/month |
| **Total** | **~$45/month** + transaction fees |

---

## 🛠️ Development Tools

### Recommended VS Code Extensions
- Prisma
- ESLint
- Prettier
- REST Client
- Thunder Client (API testing)

### Useful Commands
```bash
# Database
npm run migrate      # Run migrations
npm run generate     # Generate Prisma client
npm run studio       # Open Prisma Studio

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
```

---

## 📖 API Documentation Tools

### Option 1: Postman
```bash
# Create collection with all endpoints
# Share with frontend team
# Export as JSON for version control
```

### Option 2: Swagger/OpenAPI
```bash
npm install swagger-ui-express swagger-jsdoc

# Add to index.ts:
# Generates interactive API docs at /api-docs
```

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found"
```bash
# Solution:
npm install
npx prisma generate
```

### Issue: "Database connection failed"
```bash
# Solution:
# Check DATABASE_URL in .env
# Verify Supabase project is running
# Check firewall/network settings
```

### Issue: "Stripe webhook fails"
```bash
# Solution:
# Verify STRIPE_WEBHOOK_SECRET is correct
# Check endpoint URL is accessible
# Use stripe CLI to test locally:
stripe listen --forward-to localhost:5000/api/webhooks/stripe
```

### Issue: "JWT token expired"
```bash
# Solution:
# Use refresh token endpoint
# Implement auto-refresh in frontend
```

---

## 📞 Support Resources

**Stripe Help:**
- Docs: https://stripe.com/docs
- Support: support@stripe.com
- Discord: https://discord.gg/stripe

**Supabase Help:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Support: support@supabase.io

**Prisma Help:**
- Docs: https://www.prisma.io/docs
- Discord: https://pris.ly/discord
- GitHub: https://github.com/prisma/prisma

---

## ✅ Go-Live Checklist

### Before Launch
- [ ] All tests passing
- [ ] Error tracking setup (Sentry)
- [ ] Database backups enabled
- [ ] SSL/HTTPS configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Stripe in live mode
- [ ] Email templates tested
- [ ] Webhooks configured
- [ ] API documentation updated

### After Launch
- [ ] Monitor error logs
- [ ] Monitor API performance
- [ ] Check webhook deliveries
- [ ] Verify payments processing
- [ ] Test signup flow
- [ ] Test subscription flow

---

## 🎯 Success Metrics

**Week 1-2:**
- ✅ Database setup complete
- ✅ Authentication working
- ✅ User CRUD working

**Week 3-4:**
- ✅ Projects working
- ✅ Time tracking working
- ✅ 50% of endpoints complete

**Week 5-6:**
- ✅ Time off working
- ✅ Reports working
- ✅ Stripe integration complete
- ✅ 100% of endpoints complete

**Week 7-8:**
- ✅ All tests passing
- ✅ Deployed to production
- ✅ Webhooks working
- ✅ Ready for users

---

## 🚀 Next Steps

1. **Start with Phase 1** - Set up all accounts (1 day)
2. **Run Database Migration** - Create all tables (1 hour)
3. **Clone the structure** from BACKEND_IMPLEMENTATION_GUIDE.md
4. **Follow the weekly timeline** - One feature at a time
5. **Test as you go** - Don't wait until the end
6. **Deploy early** - Get it live and iterate

---

**You have everything you need to build the backend!** 🎉

All tables, endpoints, integrations, and code examples are ready.

**Good luck! 🚀**

---

**Last Updated:** Feb 3, 2026  
**Version:** 1.0  
**Status:** ✅ Complete & Ready
