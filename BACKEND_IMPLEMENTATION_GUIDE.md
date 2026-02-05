# 🛠️ Backend Implementation Guide

Complete code examples for implementing the Time Tracker backend API.

---

## 📦 Tech Stack Recommendation

```json
{
  "runtime": "Node.js 18+",
  "framework": "Express.js or NestJS",
  "orm": "Prisma or TypeORM",
  "validation": "Zod or Joi",
  "authentication": "JWT (jsonwebtoken)",
  "password": "bcrypt",
  "database": "PostgreSQL 14+",
  "cache": "Redis",
  "payment": "Stripe",
  "email": "SendGrid or Nodemailer",
  "logging": "Winston or Pino",
  "testing": "Jest"
}
```

---

## 🚀 Quick Start

### 1. Initialize Project

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
npm install winston

# Install dev dependencies
npm install -D typescript @types/node @types/express
npm install -D @types/jsonwebtoken @types/bcrypt
npm install -D nodemon ts-node
npm install -D jest @types/jest ts-jest
```

### 2. Project Structure

```
time-tracker-api/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── stripe.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── projects.controller.ts
│   │   ├── timeLogs.controller.ts
│   │   └── subscriptions.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── models/
│   │   └── (Prisma generates these)
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── projects.routes.ts
│   │   ├── timeLogs.routes.ts
│   │   └── subscriptions.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── email.service.ts
│   │   ├── stripe.service.ts
│   │   └── audit.service.ts
│   ├── utils/
│   │   ├── jwt.utils.ts
│   │   ├── password.utils.ts
│   │   └── validation.utils.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## 📝 Code Examples

### 1. Database Configuration (Prisma)

**prisma/schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id               String   @id @default(uuid())
  name             String
  slug             String   @unique
  plan             String   @default("starter")
  status           String   @default("active")
  maxMembers       Int      @default(10) @map("max_members")
  industry         String?
  companySize      String?  @map("company_size")
  stripeCustomerId String?  @unique @map("stripe_customer_id")
  defaultPtoDays   Int      @default(15) @map("default_pto_days")
  createdAt        DateTime @default(now()) @map("created_at")
  updatedAt        DateTime @updatedAt @map("updated_at")

  users          User[]
  projects       Project[]
  subscriptions  Subscription[]
  timeLogs       TimeLog[]     @relation("OrgTimeLogs")
  timeOff        TimeOff[]
  auditLogs      AuditLog[]
  invitations    Invitation[]
  payments       Payment[]

  @@map("organizations")
}

model User {
  id                 String    @id @default(uuid())
  organizationId     String    @map("organization_id")
  email              String    @unique
  passwordHash       String    @map("password_hash")
  emailVerified      Boolean   @default(false) @map("email_verified")
  firstName          String    @map("first_name")
  lastName           String    @map("last_name")
  phone              String?
  avatarUrl          String?   @map("avatar_url")
  role               String    @default("employee")
  status             String    @default("active")
  employeeId         String?   @map("employee_id")
  department         String?
  position           String?
  hourlyRate         Decimal?  @map("hourly_rate") @db.Decimal(10, 2)
  ptoBalance         Int       @default(0) @map("pto_balance")
  sickLeaveBalance   Int       @default(0) @map("sick_leave_balance")
  createdAt          DateTime  @default(now()) @map("created_at")
  updatedAt          DateTime  @updatedAt @map("updated_at")
  lastLoginAt        DateTime? @map("last_login_at")

  organization      Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  timeLogs          TimeLog[]
  projectMembers    ProjectMember[]
  timeOff           TimeOff[]
  notifications     Notification[]
  managedProjects   Project[]       @relation("ProjectManager")
  createdProjects   Project[]       @relation("ProjectCreator")
  approvedTimeLogs  TimeLog[]       @relation("TimeLogApprover")
  reviewedTimeOff   TimeOff[]       @relation("TimeOffReviewer")

  @@map("users")
}

model Project {
  id             String    @id @default(uuid())
  organizationId String    @map("organization_id")
  name           String
  description    String?
  code           String?
  status         String    @default("active")
  startDate      DateTime? @map("start_date") @db.Date
  endDate        DateTime? @map("end_date") @db.Date
  budget         Decimal?  @db.Decimal(12, 2)
  hourlyRate     Decimal?  @map("hourly_rate") @db.Decimal(10, 2)
  isBillable     Boolean   @default(true) @map("is_billable")
  clientName     String?   @map("client_name")
  managerId      String?   @map("manager_id")
  createdById    String?   @map("created_by")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  organization   Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  manager        User?           @relation("ProjectManager", fields: [managerId], references: [id])
  createdBy      User?           @relation("ProjectCreator", fields: [createdById], references: [id])
  members        ProjectMember[]
  timeLogs       TimeLog[]

  @@map("projects")
}

model TimeLog {
  id             String    @id @default(uuid())
  userId         String    @map("user_id")
  projectId      String    @map("project_id")
  organizationId String    @map("organization_id")
  startTime      DateTime  @map("start_time")
  endTime        DateTime? @map("end_time")
  duration       Int?      // seconds
  description    String?
  taskName       String?   @map("task_name")
  isBillable     Boolean   @default(true) @map("is_billable")
  hourlyRate     Decimal?  @map("hourly_rate") @db.Decimal(10, 2)
  amount         Decimal?  @db.Decimal(10, 2)
  status         String    @default("stopped")
  approvedBy     String?   @map("approved_by")
  approvedAt     DateTime? @map("approved_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  project      Project      @relation(fields: [projectId], references: [id], onDelete: Cascade)
  organization Organization @relation("OrgTimeLogs", fields: [organizationId], references: [id], onDelete: Cascade)
  approver     User?        @relation("TimeLogApprover", fields: [approvedBy], references: [id])

  @@map("time_logs")
}

// Add other models as needed...
```

---

### 2. Authentication Middleware

**src/middleware/auth.middleware.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    organizationId: string;
    role: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Fetch user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        organizationId: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireSameOrgOrAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const targetUserId = req.params.userId || req.params.id;

  if (req.user?.role === 'admin' || req.user?.role === 'super_admin') {
    return next();
  }

  if (req.user?.id === targetUserId) {
    return next();
  }

  return res.status(403).json({ error: 'Access denied' });
};
```

---

### 3. Authentication Controller

**src/controllers/auth.controller.ts**
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
const signupSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  organization: z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    industry: z.string().optional(),
    companySize: z.string().optional(),
  }),
  planId: z.enum(['starter', 'professional', 'enterprise']),
  stripePaymentIntentId: z.string(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const signup = async (req: Request, res: Response) => {
  try {
    // Validate request
    const data = signupSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Create organization and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: data.organization.name,
          slug: data.organization.slug,
          plan: data.planId,
          industry: data.organization.industry,
          companySize: data.organization.companySize,
          maxMembers: data.planId === 'starter' ? 10 : data.planId === 'professional' ? 50 : 999,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          organizationId: organization.id,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'admin',
          status: 'active',
        },
      });

      // Create audit log
      await tx.auditLog.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          action: 'organization.created',
          entityType: 'organization',
          entityId: organization.id,
        },
      });

      return { organization, user };
    });

    // Send welcome email (implement this)
    // await sendWelcomeEmail(data.email, result.user.firstName);

    res.status(201).json({
      success: true,
      data: {
        userId: result.user.id,
        organizationId: result.organization.id,
        email: result.user.email,
      },
      message: 'Account created successfully',
    });
  } catch (error) {
    console.error('Signup error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const data = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            plan: true,
            status: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(data.password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check user status
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    const refreshToken = jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
    );

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Remove sensitive data
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        organization: user.organization,
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as any;

    if (decoded.type !== 'refresh') {
      return res.status(403).json({ error: 'Invalid token type' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        organizationId: true,
        role: true,
        status: true,
      },
    });

    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'User not found or inactive' });
    }

    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error) {
    res.status(403).json({ error: 'Invalid refresh token' });
  }
};
```

---

### 4. Time Log Controller

**src/controllers/timeLogs.controller.ts**
```typescript
import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();

const createTimeLogSchema = z.object({
  projectId: z.string().uuid(),
  startTime: z.string().datetime(),
  description: z.string().optional(),
  taskName: z.string().optional(),
});

const stopTimeLogSchema = z.object({
  endTime: z.string().datetime(),
});

export const createTimeLog = async (req: AuthRequest, res: Response) => {
  try {
    const data = createTimeLogSchema.parse(req.body);
    const userId = req.user!.id;

    // Check if user has an active time log
    const activeLog = await prisma.timeLog.findFirst({
      where: {
        userId,
        status: 'running',
      },
    });

    if (activeLog) {
      return res.status(400).json({ error: 'You already have a running timer' });
    }

    // Get project and user details for hourly rate
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      include: {
        members: {
          where: { userId },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const hourlyRate = project.members[0]?.hourlyRate || user?.hourlyRate || project.hourlyRate;

    const timeLog = await prisma.timeLog.create({
      data: {
        userId,
        projectId: data.projectId,
        organizationId: req.user!.organizationId,
        startTime: new Date(data.startTime),
        description: data.description,
        taskName: data.taskName,
        status: 'running',
        isBillable: project.isBillable,
        hourlyRate,
      },
    });

    res.status(201).json({
      success: true,
      data: timeLog,
    });
  } catch (error) {
    console.error('Create time log error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const stopTimeLog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const data = stopTimeLogSchema.parse(req.body);

    const timeLog = await prisma.timeLog.findUnique({
      where: { id },
    });

    if (!timeLog) {
      return res.status(404).json({ error: 'Time log not found' });
    }

    if (timeLog.userId !== req.user!.id && req.user!.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (timeLog.status !== 'running') {
      return res.status(400).json({ error: 'Time log is not running' });
    }

    const endTime = new Date(data.endTime);
    const duration = Math.floor((endTime.getTime() - timeLog.startTime.getTime()) / 1000);
    const hours = duration / 3600;
    const amount = timeLog.hourlyRate ? Number(timeLog.hourlyRate) * hours : null;

    const updatedLog = await prisma.timeLog.update({
      where: { id },
      data: {
        endTime,
        duration,
        amount,
        status: 'stopped',
      },
    });

    res.json({
      success: true,
      data: updatedLog,
    });
  } catch (error) {
    console.error('Stop time log error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTimeLogs = async (req: AuthRequest, res: Response) => {
  try {
    const {
      userId,
      projectId,
      startDate,
      endDate,
      status,
      page = '1',
      limit = '50',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      organizationId: req.user!.organizationId,
    };

    if (req.user!.role === 'employee') {
      where.userId = req.user!.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime.gte = new Date(startDate as string);
      if (endDate) where.startTime.lte = new Date(endDate as string);
    }

    const [timeLogs, total] = await Promise.all([
      prisma.timeLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.timeLog.count({ where }),
    ]);

    // Calculate summary
    const summary = await prisma.timeLog.aggregate({
      where,
      _sum: {
        duration: true,
        amount: true,
      },
    });

    res.json({
      success: true,
      data: {
        timeLogs,
        summary: {
          totalHours: summary._sum.duration ? summary._sum.duration / 3600 : 0,
          totalAmount: summary._sum.amount || 0,
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get time logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

---

### 5. Stripe Webhook Handler

**src/controllers/webhooks.controller.ts**
```typescript
import { Request, Response } from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prisma = new PrismaClient();

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(400).json({ error: 'Webhook error' });
  }
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  const customerId = session.customer as string;
  const metadata = session.metadata!;

  // Create subscription record
  await prisma.subscription.create({
    data: {
      organizationId: metadata.organizationId,
      planId: metadata.planId,
      billingCycle: metadata.billingCycle,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customerId,
      stripePriceId: subscription.items.data[0].price.id,
      status: 'active',
      amount: subscription.items.data[0].price.unit_amount! / 100,
      currency: subscription.currency.toUpperCase(),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });

  // Update organization
  await prisma.organization.update({
    where: { id: metadata.organizationId },
    data: {
      stripeCustomerId: customerId,
      status: 'active',
    },
  });

  // Send welcome email
  // await sendWelcomeEmail(metadata.email, metadata.firstName);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const sub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (sub) {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    });

    await prisma.organization.update({
      where: { id: sub.organizationId },
      data: { status: 'cancelled' },
    });
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) return;

  // Create payment record
  await prisma.payment.create({
    data: {
      organizationId: subscription.organizationId,
      subscriptionId: subscription.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      stripePaymentIntentId: invoice.payment_intent as string,
      stripeInvoiceId: invoice.id,
      status: 'succeeded',
      paymentMethod: 'card',
      paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
    },
  });

  // Send receipt email
  // await sendReceiptEmail(invoice);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: invoice.subscription as string },
  });

  if (!subscription) return;

  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: 'past_due' },
  });

  // Create failed payment record
  await prisma.payment.create({
    data: {
      organizationId: subscription.organizationId,
      subscriptionId: subscription.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      stripeInvoiceId: invoice.id,
      status: 'failed',
      failureReason: 'Payment failed',
      failedAt: new Date(),
    },
  });

  // Send payment failed email
  // await sendPaymentFailedEmail(subscription);
}
```

---

### 6. Main Application File

**src/index.ts**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import projectRoutes from './routes/projects.routes';
import timeLogRoutes from './routes/timeLogs.routes';
import subscriptionRoutes from './routes/subscriptions.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Webhook endpoint (must be before express.json())
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  require('./controllers/webhooks.controller').handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/time-logs', timeLogRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🔧 Configuration Files

### package.json Scripts
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "studio": "prisma studio",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

---

## 🧪 Testing Example

**tests/auth.test.ts**
```typescript
import request from 'supertest';
import app from '../src/index';

describe('Authentication', () => {
  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('accessToken');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
```

---

## 📊 Summary

**Total Implementation Time:** 6-8 weeks
**Files to Create:** ~40-50 files
**Lines of Code:** ~10,000-15,000 LOC
**Database Tables:** 11 tables
**API Endpoints:** ~60 endpoints

**Priority Order:**
1. Week 1-2: Database + Auth + Users
2. Week 3-4: Projects + Time Logs
3. Week 5: Time Off + Reports
4. Week 6: Subscriptions + Stripe
5. Week 7-8: Testing + Deployment

---

**Status:** ✅ Ready for Implementation  
**Framework:** Node.js + Express + Prisma + PostgreSQL  
**Last Updated:** Feb 3, 2026
