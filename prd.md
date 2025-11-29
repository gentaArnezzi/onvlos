# Product Requirements Document (PRD)
## Onvlo - Client Onboarding & Workspace SaaS

**Version:** 1.0  
**Date:** November 2025  
**Author:** Product Team  
**Status:** Draft  

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Market & Target Users](#market--target-users)
4. [Core Features](#core-features)
5. [User Personas & Use Cases](#user-personas--use-cases)
6. [Scope: MVP vs Advanced](#scope-mvp-vs-advanced)
7. [Detailed Feature Specifications](#detailed-feature-specifications)
8. [User Flows](#user-flows)
9. [Data Model & Database Schema](#data-model--database-schema)
10. [Technical Architecture](#technical-architecture)
11. [API Endpoints (Overview)](#api-endpoints-overview)
12. [Non-Functional Requirements](#non-functional-requirements)
13. [Security & Compliance](#security--compliance)
14. [Analytics & Success Metrics](#analytics--success-metrics)
15. [Development Roadmap](#development-roadmap)
16. [Go-to-Market Strategy](#go-to-market-strategy)

---

## Executive Summary

**Product Name:** Onvlo (Working Title: OnboardHub)

**Elevator Pitch:**  
A unified SaaS platform that streamlines client onboarding and collaboration for agencies, freelancers, and service-based businesses. Consolidates onboarding funnels, invoicing, task management, client portals, automation workflows, and AI-assisted communication into one integrated workspace—replacing Notion, Trello, Slack, Calendly, and invoicing tools.

**Problem:**  
- Agencies spend hours managing onboarding (collecting data, signing contracts, payments, portal setup) across disconnected tools.
- Clients experience friction: multiple logins, unclear next steps, scattered information.
- Team coordination breaks down: no unified view of pipeline, client status, and revenue.

**Solution:**  
- Share 1 link → client completes onboarding (data, contract, payment) → automatic portal access.
- Everything-in-one: client communication, task tracking, file sharing, invoicing, calendar.
- Smart automation: trigger workflows on key events (invoice paid, onboarding complete, due date approaching).
- AI-powered insights: assistant understands client data and workflow context.

**Target Market:**  
- Marketing agencies (70% TAM)
- Creative studios (design, video, content)
- Software/tech consulting firms
- Coaches, consultants, freelancers with recurring client work
- Digital marketing consultants

**Business Model:**  
Subscription SaaS with usage-based tiering:
- **Starter:** $29/mo (1 workspace, 3 team members, 10 clients, basic funnels)
- **Professional:** $99/mo (unlimited team, unlimited clients, advanced workflows, custom domain)
- **Enterprise:** Custom pricing (dedicated support, SSO, API access, SLA)

---

## Product Overview

### Vision
To become the "operating system" for client-facing businesses—one platform where agencies manage every aspect of client relationships from acquisition to delivery and billing.

### Core Value Propositions
1. **Time Savings:** Reduce onboarding cycle from 3–5 days to 2–4 hours.
2. **Revenue Acceleration:** Automation triggers faster invoicing and payment collection.
3. **Better Client Experience:** Clear journey, quick turnaround, professional workspace.
4. **Operational Efficiency:** Replace 5+ tools with 1 integrated platform.
5. **Data Intelligence:** AI-powered insights and smart recommendations.

### Key Differentiators vs. Competitors
| Aspect | OnboardHub | Notion | Asana | Onvlo |
|--------|-----------|--------|-------|-------|
| **Onboarding Funnels** | ✅ Built-in | ❌ No | ❌ No | ✅ Yes |
| **Client Portal** | ✅ Native | ⚠️ Complex | ⚠️ Complex | ✅ Yes |
| **Invoicing** | ✅ Native | ❌ No | ❌ No | ✅ Yes |
| **Workflows/Automation** | ✅ Visual | ⚠️ Limited | ✅ Yes | ✅ Yes |
| **AI Assistant** | ✅ Context-aware | ⚠️ Limited | ⚠️ Limited | ✅ Yes |
| **All-in-One Cost** | 💰 Low | 💰 Low | 💰 High | 💰 High |

---

## Market & Target Users

### Total Addressable Market (TAM)
- **Agencies globally:** ~500K registered
- **Active users per agency:** 3–5 (owner, AM, team members)
- **Average revenue per user:** $40–100/mo
- **TAM:** ~$6–24B annually

### Target Segments (Priority Order)
1. **Marketing Agencies** (70% initial focus)  
   - Size: 5–50 people
   - Pain: managing client onboarding, project tracking, billing across multiple tools
   - Acquisition: agencies.com, FounderPal, ProductHunt, LinkedIn

2. **Creative Studios** (Design, Video, Content) (20%)  
   - Size: 2–20 people
   - Pain: portfolio/contract management, client feedback loops, invoicing
   - Acquisition: creative communities, design conferences

3. **Consultants & Coaches** (10%)  
   - Size: Solo–5 people
   - Pain: managing client contracts, scheduling, payment tracking
   - Acquisition: LinkedIn, self-employed communities, Indie Hackers

### User Research Insights
- **Pain Point #1:** 65% spend >5 hours/week managing onboarding across tools
- **Pain Point #2:** 72% lose >$5K/year to invoice delays and manual follow-up
- **Pain Point #3:** 58% report client confusion about next steps in onboarding

---

## Core Features

### Feature Map (MVP + Advanced)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONBOARDHUB - CORE MODULES                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. AUTH & WORKSPACE                                           │
│     ✅ Multi-tenant workspace  ✅ Role-based access            │
│     ✅ Team members           ✅ Client access                 │
│                                                                  │
│  2. ONBOARDING FUNNELS                    ⭐ CORE              │
│     ✅ Funnel builder         ✅ Step templates                │
│     ✅ Form collection        ✅ Contract signing              │
│     ✅ Payment collection     ✅ Auto client setup             │
│                                                                  │
│  3. CLIENT MANAGEMENT                     ⭐ CORE              │
│     ✅ Client list/CRM        ✅ Client workspace              │
│     ✅ Chat per client        ✅ File sharing                  │
│     ✅ Portal customization   ⭐ (Advanced: custom domain)    │
│                                                                  │
│  4. BOARDS & TASKS                        ⭐ CORE              │
│     ✅ Kanban boards          ✅ Task management               │
│     ✅ Drag & drop            ✅ Due dates & assignees         │
│     ✅ Multi-pipeline         ✅ Comments & attachments        │
│                                                                  │
│  5. INVOICING & PAYMENTS                  ⭐ CORE              │
│     ✅ Invoice creation       ✅ Payment gateway integration   │
│     ✅ Single invoices        ✅ Payment tracking              │
│     ✅ Client portal payment  ⭐ (Advanced: recurring)        │
│                                                                  │
│  6. WORKFLOWS & AUTOMATION                                      │
│     ✅ Visual workflow builder ✅ Trigger/action rules         │
│     ✅ Chat templates          ✅ Email templates              │
│     ✅ Task auto-creation      ⭐ (Advanced: conditions)      │
│                                                                  │
│  7. CALENDAR & SCHEDULING                                       │
│     ✅ Calendar views          ✅ Event management             │
│     ✅ Team availability       ⭐ (Advanced: public booking)   │
│                                                                  │
│  8. AI ASSISTANT (Infinity-style)                              │
│     ✅ Chat bot Q&A           ✅ Task/invoice queries          │
│     ⭐ (Advanced: Brain/KB)   ⭐ (Advanced: content gen)       │
│                                                                  │
│  9. WEBSITE BUILDER                                             │
│     ⭐ (Advanced Phase)  ✅ Drag & drop           ✅ Publishing│
│                                                                  │
│ 10. BILLING & ANALYTICS                                         │
│     ✅ SaaS subscription       ✅ Usage tracking               │
│     ✅ Payment processing      ✅ Basic reporting              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Legend:
  ✅ = MVP Feature
  ⭐ = Advanced/Future Phase
```

---

## User Personas & Use Cases

### Persona 1: Agency Owner (Alex)
**Background:**  
- Runs a 15-person digital marketing agency
- Closes 3–5 new clients per month
- Overwhelmed managing multiple tools (Notion, Airtable, Stripe, Slack, Calendly)

**Goals:**
- Reduce time spent on administrative onboarding tasks
- Have a single source of truth for client status
- Automate billing reminders and payment collection

**Pain Points:**
- Clients get lost in onboarding (unclear next steps)
- Team can't see who's handling what
- Invoice follow-up is manual and inconsistent

**Use Case: New Client Onboarding**
1. Alex creates a "Website Design" funnel with steps: questionnaire → contract → payment → portal access
2. Sends link to prospect via email
3. Prospect fills form, e-signs contract, pays deposit
4. System auto-creates client in database, assigns AM, creates workspace, sends welcome email
5. Client sees tasks and can upload assets from day 1
6. Alex gets dashboard showing "5 clients in progress, 2 awaiting payment"

### Persona 2: Account Manager (Jordan)
**Background:**  
- 5 years in agency, manages 12–15 active clients
- Responsible for delivery, communication, and upsell

**Goals:**
- See client status at a glance
- Communicate seamlessly with clients
- Track deliverables and project timeline
- Generate insights for client reports

**Pain Points:**
- Context-switching between tools (Slack, Trello, email, client site)
- Hard to track who said what and when
- Client requests get buried in long Slack threads

**Use Case: Weekly Client Check-in**
1. Jordan opens OnboardHub dashboard → sees all 15 clients on boards
2. Clicks "AF Marketing" client → opens portal: chat history, pending tasks, uploaded files
3. Reviews last 3 messages, sees "waiting on copy review from me"
4. Uses AI bot ("@bot summarize last week with AF Marketing") → gets quick recap
5. Posts reply in chat with feedback, tags task as "In Review"
6. Schedules next touchpoint in calendar → auto-sends reminder

### Persona 3: Client (Client Contact)
**Background:**  
- Marketing manager at B2B SaaS company
- Has been through agency onboarding before (painful experience)
- Wants clarity and quick turnaround

**Goals:**
- Understand what's expected of me
- Get clear communication from my account manager
- See progress on deliverables
- Know exactly how much I owe and when

**Pain Points:**
- Asked to sign contract via DocuSign, fill form in Typeform, and pay on Stripe (3 different logins)
- Can't find where to upload assets or check status
- Gets confused by multiple emails from different people

**Use Case: Getting Onboarded**
1. Client receives link: "Complete your onboarding in 5 minutes"
2. Clicks → fills questionnaire, reviews contract, e-signs
3. Sees invoice ($5K), enters card, pays immediately
4. Gets email: "Welcome! Your account is ready. Click here to access your portal"
5. Logs in (single sign-on or password) → sees portal with:
   - Tasks: "Submit brand guidelines", "Introduce team", etc.
   - Chat: direct line to account manager
   - Files: place to upload assets
   - Invoices: upcoming payments
6. Client feels confident, knows what to do next

---

## Scope: MVP vs Advanced

### MVP (v0.1 – v0.5) – Launch Timeline: 12–16 weeks

#### Must Have (MVP Tier 1)
- [x] **Workspace & Auth**
  - Multi-tenant workspace creation
  - User signup/login via email (BetterAuth)
  - Role-based access (Owner, Admin, Member, Client)
  - Team member invitation

- [x] **Client Management (CRM Light)**
  - Client list (table view with filters/search)
  - Create client manually or via funnel
  - Client detail page
  - Basic info (name, email, company, category)
  - Status (Lead, Active, Completed, Archived)

- [x] **Onboarding Funnels (Basic)**
  - Funnel list & builder
  - Step types: Form, Contract, Invoice, Automation
  - Reorder steps drag-and-drop
  - Share public link
  - Client progress tracking

- [x] **Client Portal (Read-only MVP)**
  - Client login to workspace
  - View assigned tasks
  - View invoices & payment status
  - Chat room (read/post messages)
  - File upload/download area

- [x] **Boards & Tasks (Basic)**
  - Kanban board creation (Sales, Onboarding, Delivery)
  - Drag-drop cards between columns
  - Task creation: title, description, assignee, due date
  - Task list view (My Tasks)
  - Mark task complete

- [x] **Invoices (Single)**
  - Create invoice: client, items, prices, tax, subtotal
  - Invoice status: Draft, Sent, Paid, Overdue
  - Email invoice to client
  - PDF generation
  - View invoice history

- [x] **Payments (1 Gateway)**
  - Payment link integration (Stripe or local: Midtrans/Xendit)
  - Client pays via payment link
  - Webhook confirmation → update invoice status
  - Basic payment history

- [x] **Workflows (Basic)**
  - List workflows
  - Basic trigger: "Invoice paid", "Funnel step completed", "New client"
  - Basic actions: "Create task", "Send email template", "Send chat message"
  - Simple schedule (Immediately / After X minutes)

- [x] **Calendar (Basic)**
  - Day/Week/Month view
  - Create event: title, date, time, attendees
  - View all workspace events
  - Add to My Tasks & Calendar

- [x] **Chat & Communication**
  - Per-client chat room
  - Message history
  - Attach files & images
  - Read receipts
  - Basic notifications

- [x] **AI Assistant (Basic)**
  - Chat bot accessible via @mention
  - Q&A: task count, invoice status, client activity
  - Basic context from tasks/invoices/messages
  - No training/fine-tuning

#### Nice to Have (MVP Tier 2 - if time)
- [ ] Client space customization (logo upload, color scheme)
- [ ] Recurring tasks
- [ ] Task templates
- [ ] Email template library
- [ ] Basic reporting (revenue by month, tasks completed)
- [ ] Slack integration

### Advanced (v1.0 – v2.0) – Post-Launch Features

- [ ] **Recurring Invoices & Subscriptions**
  - Automatic invoice generation (monthly/quarterly)
  - Recurring payment collection
  - Subscription status tracking

- [ ] **Website & Page Builder**
  - Drag-drop page builder
  - Hero, services, portfolio, testimonials, CTA blocks
  - Publish to subdomain or custom domain
  - Link to funnel from site

- [ ] **Public Booking/Scheduling**
  - Calendar booking link for clients/prospects
  - Choose available slots
  - Zoom/Google Meet integration
  - Automatic reminders

- [ ] **Advanced Workflows**
  - Conditional triggers (e.g., "if invoice > $1000 AND paid within 7 days")
  - More actions: create invoice, update client field, call webhook
  - Zapier/Make.com integration
  - Workflow templates

- [ ] **Brain / Knowledge Base**
  - Upload documents, PDFs, past proposals
  - AI indexing & RAG (retrieval-augmented generation)
  - Generate content: email templates, proposal sections, SOP
  - Prompt library per role

- [ ] **Advanced Automation**
  - Multi-step workflows
  - Conditions (if/then logic)
  - Delay/wait steps
  - Parallel actions

- [ ] **Portal Customization**
  - Custom domain per client
  - White-label branding (logo, colors, fonts)
  - Custom CSS (advanced)

- [ ] **Team Roles & Permissions**
  - Granular permissions (who can see what module)
  - Client visibility rules (some clients only visible to certain team members)
  - Audit log

- [ ] **Integrations**
  - Zapier/Make.com
  - Slack (notifications, commands)
  - Google Calendar sync
  - HubSpot sync

- [ ] **Analytics & Reporting**
  - Dashboard: revenue, client count, onboarding time, active projects
  - Custom reports
  - Export to CSV/PDF

---

## Detailed Feature Specifications

### Feature 1: Onboarding Funnels

#### 1.1 Funnel Overview (List Page)
**Screenshot Reference:** Funnel list shows all funnels with:
- Funnel name (e.g., "Website Design", "Marketing Retainer")
- Created date
- Onboarded clients (avatar stack + count)
- Onboarding status (visual summary per funnel)
- Actions: Edit, Duplicate, Delete, View analytics

**UI Components:**
- Search bar (filter by name)
- Table or card grid layout
- Bulk actions (select multiple, archive)

**Flow:**
1. Owner clicks "New Funnel"
2. Prompted for funnel name and description
3. Routed to funnel builder

#### 1.2 Funnel Builder
**Step Types:**

| Step Type | Purpose | Client Input | Output |
|-----------|---------|-------------|--------|
| **Form** | Collect questionnaire/data | Text, checkboxes, file upload | Store in client record |
| **Contract** | Review & sign agreement | PDF preview + agree checkbox + e-signature | signed_at, signature_url |
| **Invoice** | Preview & setup payment | Invoice view | invoice_id, link to payment |
| **Automation** | Trigger backend actions | N/A | Create client, send email, setup portal |

**Step Configuration:**
- Form step:
  - Add fields (text, email, select, multiline, file, date)
  - Required/optional toggle
  - Field validation rules
  - Progress messaging

- Contract step:
  - Upload PDF template or paste text
  - Mark sections as "signature required"
  - Automatically replace `{{client_name}}`, `{{date}}`, etc.
  - One-click e-signature (Docusign integration or basic checkbox)

- Invoice step:
  - Link to pre-configured invoice (or create new)
  - Customize amount (fixed or from form fields)
  - Discount code toggle
  - Payment gateway selection

- Automation step:
  - Trigger list of actions (create client, create board card, send email, send chat message)
  - Configure each action

**Builder UI:**
- Left sidebar: Step list, drag-reorder
- Center canvas: Step preview
- Right sidebar: Step config panel
- "Test" button: preview funnel as client

**Data Captured:**
```
Funnel {
  id: UUID
  workspace_id: UUID
  name: string
  description: string
  steps: FunnelStep[]
  created_at: timestamp
  updated_at: timestamp
  published: boolean
  public_url: string (URL-safe slug)
}

FunnelStep {
  id: UUID
  funnel_id: UUID
  step_type: enum (Form, Contract, Invoice, Automation)
  order: integer
  config: JSON (field definitions, template, actions)
  actions: StepAction[]
}

StepAction {
  id: UUID
  step_id: UUID
  action_type: enum (send_email, create_invoice, create_client_space, send_chat)
  config: JSON (template_id, email recipient, message text)
}
```

#### 1.3 Client Funnel Journey
**Flow:**
1. Client receives public link: `yourdomain.com/onboard/website-design`
2. Client lands on step 1 (Form)
   - Fills questionnaire
   - Uploads files if needed
   - Clicks "Next"
3. Step 2 (Contract)
   - Sees PDF preview
   - Clicks "I Agree" checkbox
   - E-signs (or types name)
   - Clicks "Next"
4. Step 3 (Invoice)
   - Sees invoice summary
   - Clicks "Pay Now"
   - Enters card details or clicks Apple Pay
5. Payment confirmed
   - Step 4 automation triggers:
     - Create Client record in system
     - Create ClientSpace (portal)
     - Send welcome email
     - Create board card in "Onboarding" column
6. Client gets email: "Your account is ready! Click here to login"

**Session State:**
```
ClientOnboardingSession {
  id: UUID
  funnel_id: UUID
  client_email: string
  current_step: integer
  progress_data: JSON {
    form_responses: {},
    contract_signed: boolean,
    signature_url: string,
    invoice_id: UUID,
    payment_confirmed: boolean
  }
  created_at: timestamp
  completed_at: timestamp (null until finished)
  magic_link_token: string (for resume link)
}
```

**Resume Functionality:**
- Client can resume mid-funnel via magic link (valid 7 days)
- Progress preserved; can pick up from last incomplete step

---

### Feature 2: Client Management & Workspace

#### 2.1 Clients List (CRM)
**View Type:** Grid cards (like Onvlo screenshot)

**Card Content:**
- Client logo/avatar (first letter or uploaded)
- Company name (linked to detail)
- Category badge (e.g., "Design", "Marketing")
- Short description
- Members avatars (team assigned to client)
- Engagement bar (% complete of onboarding, or activity index)
- Context menu (3-dot): Open Space, New Invoice, New Task, Start Funnel, Archive

**Filters & Sort:**
- Filter by: category, status (Lead/Active/Completed), owner, date range
- Sort by: Created, Updated, Name, Value (contract amount)
- Search by: name, email, notes

**Data Structure:**
```
ClientCompany {
  id: UUID
  workspace_id: UUID
  name: string
  email: string
  category: string (enum or tag)
  description: string
  logo_url: string (nullable)
  status: enum (Lead, Active, Onboarding, Completed, Archived)
  contract_value: decimal
  contract_start: date
  contract_end: date
  owner_user_id: UUID (primary AM)
  created_at: timestamp
  updated_at: timestamp
  metadata: JSON (custom fields)
}
```

#### 2.2 Client Space (Portal)
**Client Login:**
- Magic link (preferred) or password + email
- BetterAuth session management

**Portal Tabs:**

##### Tab: Chat
- Conversation thread with team & client
- Real-time messaging
- File/image attachments
- User avatars & timestamps
- Search message history

##### Tab: Tasks
- Client-visible tasks (visibility flag per task)
- Card layout: title, due date, status, attachments
- Filter by status (To Do, In Progress, Done)
- Task detail modal: description, comments, attachments

##### Tab: Files
- Folder-based structure (optional)
- Upload button (drag-and-drop)
- List files by: name, date, size
- Link to tasks
- Download option

##### Tab: Invoices
- List of all invoices for this client
- Status badge (Draft, Sent, Paid, Overdue)
- Amount, due date, paid date
- "Pay Now" button (if Sent or Overdue)
- Download PDF
- Payment history

##### Tab: Summary (Optional)
- Quick stats: tasks remaining, next milestone, contact person
- Upcoming events/meetings

**Portal Customization (Advanced):**
- Custom domain (e.g., workspace.af-marketing.onboardhub.com)
- Logo upload
- Color scheme (primary, accent)
- Custom intro message

**Data Structure:**
```
ClientSpace {
  id: UUID
  client_id: UUID
  workspace_id: UUID
  name: string (derived from client)
  public_url: string (slug)
  custom_domain: string (nullable, advanced feature)
  logo_url: string (nullable)
  branding: JSON {
    primary_color: string,
    accent_color: string,
    font_family: string
  }
  password_hash: string (if login with password)
  created_at: timestamp
}

ClientSpaceAccess {
  id: UUID
  space_id: UUID
  user_id: UUID (client contact user)
  role: enum (Member, Viewer)
  permissions: JSON {
    can_view_tasks: boolean,
    can_view_invoices: boolean,
    can_view_files: boolean,
    can_upload_files: boolean,
    can_message: boolean,
    can_pay_invoices: boolean
  }
}
```

---

### Feature 3: Boards & Tasks

#### 3.1 Boards
**Types of Boards:**
- Sales Pipeline (Lead → Prospect → Contract → Closed)
- Onboarding Pipeline (Inquiry → Onboarding → Active → Completed)
- Delivery Pipeline (Backlog → In Progress → Review → Done)
- Custom (user-defined)

**Board View:**
- Kanban layout: columns (stages) with cards (clients/projects)
- Drag-drop cards between columns
- Column settings: rename, WIP limit (advanced), hide archived
- Group by: Client, Assignee, Category (advanced)
- Filter: client, assignee, date range
- Sort: name, created date, custom order

**Card Details (Popover/Modal):**
- Title & description
- Status badge
- Assignee avatar(s) + change
- Due date + change
- Tags/category
- Attached items (tasks count, comments count, files count)
- Action: Open full task detail, move card, archive

**Data Structure:**
```
Board {
  id: UUID
  workspace_id: UUID
  name: string
  board_type: enum (Sales, Onboarding, Delivery, Custom)
  columns: BoardColumn[]
  created_at: timestamp
}

BoardColumn {
  id: UUID
  board_id: UUID
  name: string
  order: integer
  wip_limit: integer (nullable)
  collapsed: boolean
}

Card {
  id: UUID
  column_id: UUID
  client_id: UUID (references ClientCompany)
  title: string
  description: string
  order: integer (for sorting within column)
  assignees: User[]
  due_date: date (nullable)
  tags: string[]
  created_at: timestamp
  moved_at: timestamp (for sorting/activity)
}
```

#### 3.2 Tasks
**Task Properties:**
- Title (required)
- Description (rich text)
- Status (To Do, In Progress, In Review, Done)
- Assignee(s)
- Due date
- Priority (Low, Medium, High)
- Client (linked to ClientCompany)
- Tags/category
- Attachments
- Comments
- Created by, created at
- Updated at

**Task Views:**
- My Tasks (global, filtered to current user)
- Tasks by client (all tasks for one client)
- Tasks by board (backlog tasks for a board)
- Calendar view (due date timeline)

**Task Creation:**
- Quick add from board (card) or task list
- Full modal: all fields
- Bulk import (CSV)

**Task Actions:**
- Assign/unassign
- Change status (drag or dropdown)
- Edit due date
- Add comment
- Attach file
- Link to invoice or client
- Create subtask (advanced)
- Duplicate

**Data Structure:**
```
Task {
  id: UUID
  workspace_id: UUID
  title: string
  description: string (rich text JSON or HTML)
  status: enum (Todo, InProgress, InReview, Done)
  priority: enum (Low, Medium, High)
  due_date: date (nullable)
  client_id: UUID (nullable, references ClientCompany)
  card_id: UUID (nullable, references Card)
  assignees: User[]
  tags: string[]
  created_by_user_id: UUID
  created_at: timestamp
  updated_at: timestamp
  completed_at: timestamp (nullable)
  visibility: enum (Internal, ClientVisible, ManagerOnly)
  metadata: JSON (custom fields)
}

TaskComment {
  id: UUID
  task_id: UUID
  user_id: UUID
  content: string (rich text)
  attachments: string[] (file URLs)
  created_at: timestamp
  updated_at: timestamp
}

TaskAttachment {
  id: UUID
  task_id: UUID
  file_url: string
  file_name: string
  file_size: integer
  uploaded_at: timestamp
}
```

---

### Feature 4: Invoices & Payments

#### 4.1 Invoice Creation
**Invoice Form:**
- Type: Single / Recurring (MVP: Single only)
- Client selector (dropdown, search by name/email)
- Currency selector (USD, IDR, etc.)
- Due date picker
- Items table:
  - Item name (service, product)
  - Quantity
  - Unit price
  - Subtotal (auto-calc: qty × price)
  - Delete row
- Add item button
- Subtotal (auto-sum)
- Discount field (fixed or percentage)
- Tax rate dropdown
- Tax amount (auto-calc)
- **Total (auto-calc)**
- Notes/terms (optional, rich text)
- Save as draft / Preview / Send

**Invoice Status Workflow:**
- Draft → Owner can edit
- Sent → Email sent to client, awaiting payment
- Paid → Payment confirmed via webhook
- Overdue → Due date passed, not paid
- Archived → Completed, don't show in active list

**Invoice History:**
- View all invoices for workspace or client
- Filter by status, date range, amount
- Search by invoice number or client name
- Bulk actions (resend, duplicate, mark paid, archive)

**Data Structure:**
```
Invoice {
  id: UUID
  workspace_id: UUID
  client_id: UUID
  invoice_number: string (auto-generated: "INV-001", "INV-002")
  currency: enum (USD, IDR, SGD, AUD, etc.)
  amount_subtotal: decimal
  discount_amount: decimal
  discount_percentage: decimal (nullable)
  tax_rate: decimal
  tax_amount: decimal
  total_amount: decimal
  status: enum (Draft, Sent, Paid, Overdue, Archived)
  due_date: date
  issued_date: date
  paid_date: date (nullable)
  notes: string (nullable)
  items: InvoiceItem[]
  created_by_user_id: UUID
  created_at: timestamp
  updated_at: timestamp
}

InvoiceItem {
  id: UUID
  invoice_id: UUID
  name: string
  quantity: integer
  unit_price: decimal
  subtotal: decimal (auto-calc)
}

Payment {
  id: UUID
  invoice_id: UUID
  gateway: enum (Stripe, Midtrans, Xendit)
  gateway_payment_id: string (reference from gateway)
  amount: decimal
  currency: string
  status: enum (Pending, Completed, Failed, Refunded)
  paid_at: timestamp
  metadata: JSON (gateway response)
}
```

#### 4.2 Payment Integration
**Payment Flow:**
1. Client clicks "Pay Now" on invoice (from email or portal)
2. Routed to payment page with invoice summary
3. Enters card details or selects digital wallet (Apple Pay, Google Pay)
4. Gateway processes payment
5. Webhook returned: success/failure
6. If success:
   - Create Payment record
   - Update Invoice status → Paid
   - Trigger workflow: "Invoice paid" (send thank you email, create task, etc.)

**Supported Gateways (MVP):**
- Stripe (international)
- Local (Midtrans for Indonesia, Xendit as backup)

**Payment Page UI:**
- Invoice summary (items, subtotal, tax, total)
- Discount code input (apply button)
- Card input (Stripe Elements / Midtrans standard form)
- Security badges (SSL, PCI-DSS)
- Terms checkbox
- "Pay Now" button (disabled until amount confirmed)

**Webhook Handler:**
```
POST /api/webhooks/payment/stripe
POST /api/webhooks/payment/midtrans
POST /api/webhooks/payment/xendit
```

Webhook events:
- `payment.success`: Update invoice to Paid, log Payment
- `payment.failed`: Log failure, notify owner
- `payment.refunded`: Revert invoice status, notify client

---

### Feature 5: Workflows & Automation

#### 5.1 Workflow Builder (Basic)
**Workflow Structure:**
```
Workflow {
  name: string
  trigger: Trigger
  actions: Action[]
  schedule: Schedule (optional)
  active: boolean
}

Trigger {
  type: enum (InvoicePaid, FunnelStepCompleted, NewClientCreated, DueDateApproaching, TaskCompleted)
  config: JSON (e.g., client_id for specific client, days_before for due date)
}

Action {
  type: enum (SendEmail, CreateTask, MoveCard, SendChatMessage)
  config: JSON (template_id, recipient, message, assignee)
}

Schedule {
  type: enum (Immediately, Delay)
  delay_minutes: integer (if type=Delay)
}
```

**Workflow Examples:**

| Trigger | Actions | Business Logic |
|---------|---------|-----------------|
| Invoice Paid | 1. Send "Thank you" email 2. Create task "Generate report" | Client paid → thank them + next step |
| Funnel Completed | 1. Create Client 2. Create board card in "Onboarding" 3. Send chat message "Welcome!" | New client through funnel → setup |
| New Client Created | 1. Send email "Account ready" 2. Create meeting in calendar | New client manually added → notify |
| Task Completed | 1. Move card to "Review" 2. Send chat to client "Deliverable ready" | Team completes task → client notified |

#### 5.2 Workflow UI
**List Page:**
- Table: workflow name, trigger, last run, status (active/inactive), actions
- Search, filter by trigger type
- Create new workflow button

**Editor:**
- Step 1: Select trigger from dropdown
- Step 2: Configure trigger (e.g., if specific client, timezone, conditions)
- Step 3: Add actions (sequential, multiple allowed)
- Each action has configuration panel
- Preview mode (mock execution)
- Save / Activate toggle

**Data Structure:**
```
Workflow {
  id: UUID
  workspace_id: UUID
  name: string
  description: string
  trigger: JSON {
    type: string,
    config: object
  }
  actions: JSON [
    { type: string, config: object },
    ...
  ]
  enabled: boolean
  created_by_user_id: UUID
  created_at: timestamp
  updated_at: timestamp
}

WorkflowExecution {
  id: UUID
  workflow_id: UUID
  trigger_event_id: UUID
  trigger_data: JSON (invoice_id, client_id, etc.)
  status: enum (Pending, Running, Completed, Failed)
  executed_at: timestamp
  result: JSON (action results, errors)
}
```

#### 5.3 Supported Triggers & Actions

**Triggers:**
1. **Invoice Paid**
   - Config: specific client (optional), amount threshold (optional)
   - Trigger data: invoice_id, amount, client_id

2. **Funnel Step Completed**
   - Config: funnel_id, step_type
   - Trigger data: client_onboarding_session_id, client_id

3. **New Client Created**
   - Config: (none)
   - Trigger data: client_id

4. **Due Date Approaching**
   - Config: days before (e.g., 3 days before)
   - Trigger data: task_id, due_date

5. **Task Completed**
   - Config: specific task (optional), any task
   - Trigger data: task_id, client_id

**Actions:**
1. **Send Email**
   - Config: template_id, recipient(s) (client, assigned user, custom)
   - Template variables: {{client_name}}, {{task_title}}, {{invoice_amount}}, etc.

2. **Create Task**
   - Config: title, description (template), assignee(s), due date offset, tags
   - Linked to client if trigger had client_id

3. **Move Card**
   - Config: target column_id, board_id
   - Moves card in kanban board

4. **Send Chat Message**
   - Config: message template, client_space_id or all client spaces
   - Template variables like email

5. **Advanced Actions (Future)**
   - Create invoice
   - Update client field
   - Call webhook
   - Send Slack message

---

### Feature 6: Calendar & Scheduling

#### 6.1 Calendar Views
**View Types:**
- Day: Hourly timeline (8 AM – 6 PM typical)
- Week: 7-day view with time slots
- Month: Grid view (only date, no time details)
- Agenda/List: Upcoming events sorted by date/time

**Event Types:**
- Meeting: with time, attendees, location (Zoom/physical address), notes
- Task: all-day or timed
- Milestone: all-day marker (no specific time)
- Time block: personal availability block (for calendar sync)

**Event Details (Popover/Modal):**
- Title
- Date & time (start, end)
- Recurrence (daily/weekly/monthly, advanced feature)
- Attendees (internal team + clients)
- Location/video link (Zoom, Google Meet, custom link)
- Description
- Attachment (agenda, brief)
- RSVP status (if attendee)
- Delete / Edit / Duplicate buttons

**Data Structure:**
```
CalendarEvent {
  id: UUID
  workspace_id: UUID
  title: string
  description: string (nullable)
  event_type: enum (Meeting, Task, Milestone, TimeBlock)
  start_time: timestamp
  end_time: timestamp
  all_day: boolean
  recurrence: JSON (nullable, advanced) {
    frequency: string (Daily, Weekly, Monthly),
    interval: integer,
    end_date: date (nullable)
  }
  location: string (nullable)
  video_link: string (nullable, Zoom/Meet)
  created_by_user_id: UUID
  created_at: timestamp
  updated_at: timestamp
}

CalendarEventAttendee {
  id: UUID
  event_id: UUID
  user_id: UUID (internal user or client contact)
  rsvp_status: enum (Pending, Accepted, Declined)
  email: string (for external invites)
}
```

#### 6.2 Calendar Sync (Advanced Phase)
- One-way sync from OnboardHub to Google Calendar
- Two-way sync with team calendars (with permission)
- Availability based on calendar events (for scheduling)

---

### Feature 7: Chat & Communication

#### 7.1 Chat Interface
**Chat Types (MVP):**
- **Client Space Chat**: One conversation per client space
- **Internal Team Chat** (Advanced): Team channel, DM

**Message Features:**
- Text messages (rich text: bold, italic, links)
- File attachments (inline image preview, downloadable files)
- Emoji reactions
- Message threading/replies (advanced)
- Search message history (by keyword, date range, sender)
- Pin important messages
- Delete/edit message (show "edited" timestamp)

**Notifications:**
- New message: in-app badge + email (configurable per user)
- @mention: priority notification
- Unread indicators (bubble count, bold name)

**Read Status:**
- Timestamp when message read by each participant
- "Seen by: Jordan, Alex" indicator

**Data Structure:**
```
Conversation {
  id: UUID
  workspace_id: UUID
  client_space_id: UUID (for client chats)
  title: string (derived from client or topic)
  created_at: timestamp
}

Message {
  id: UUID
  conversation_id: UUID
  user_id: UUID
  content: string (rich text JSON or markdown)
  attachments: Attachment[]
  created_at: timestamp
  updated_at: timestamp (null if never edited)
  deleted_at: timestamp (nullable, soft delete)
}

Attachment {
  id: UUID
  message_id: UUID
  file_url: string (S3 or local storage)
  file_name: string
  file_type: string (mime type)
  file_size: integer
}

ConversationParticipant {
  id: UUID
  conversation_id: UUID
  user_id: UUID
  last_seen_message_id: UUID (for read status)
  last_seen_at: timestamp
  muted: boolean (notifications muted)
}
```

---

### Feature 8: AI Assistant (Basic)

#### 8.1 Infinity-style AI Bot
**Capabilities (MVP):**
- **Task Queries**
  - "How many tasks are outstanding for client AF Marketing?"
  - "List tasks due this week"
  - "What's my workload tomorrow?"

- **Invoice Queries**
  - "What's our revenue this month?"
  - "Which invoices are overdue?"
  - "Show invoices from [client name]"

- **Client Activity**
  - "Summarize last week with [client]"
  - "What did [client] upload?"
  - "When's the next meeting with [client]?"

- **Quick Insights**
  - "How many clients completed onboarding this month?"
  - "Show me onboarding funnels by conversion rate"

**Implementation:**
- LLM: OpenAI GPT-3.5 or Claude (Anthropic)
- Context: User asks question → system constructs semantic search query → retrieves relevant tasks, invoices, messages from DB → LLM generates answer
- Prompt engineering: System prompt + context + user question → answer

**Bot Access:**
- Accessible in chat (command: `@bot [question]` or `/ask [question]`)
- Appears as "Infinity" bot with special avatar
- Response formatting: markdown, bullet points, data tables

**Data Structure:**
```
BotConversation {
  id: UUID
  workspace_id: UUID
  user_id: UUID
  messages: BotMessage[]
  created_at: timestamp
}

BotMessage {
  id: UUID
  conversation_id: UUID
  role: enum (User, Assistant)
  content: string
  context_used: JSON (tasks_id[], invoices_id[], etc.)
  created_at: timestamp
}
```

#### 8.2 AI Training (Advanced Phase)
- Fine-tuning on workspace-specific terminology (client names, custom fields)
- Custom system prompt per team role (CEO vs. designer)
- Feedback loop (user upvotes/downvotes answers to improve)

---

### Feature 9: Workspace & Billing (SaaS)

#### 9.1 Workspace Management
**Workspace Settings:**
- Workspace name
- Logo & branding
- Workspace members (list, invite new, remove, change role)
- Subscription tier
- Billing contact email
- Timezone default

**Member Management:**
- List all members with role, email, status (Active, Invited, Inactive)
- Invite new member (email invite link)
- Change member role (Owner → Admin → Member downgrade only)
- Remove member (confirm action, data remains)
- Member activity log (optional, advanced)

**Data Structure:**
```
Workspace {
  id: UUID
  name: string
  logo_url: string (nullable)
  timezone: string (default: UTC)
  subscription_tier: enum (Starter, Professional, Enterprise)
  subscription_status: enum (Active, Trialing, Cancelled, Suspended)
  billing_email: string
  created_by_user_id: UUID
  created_at: timestamp
}

WorkspaceMember {
  id: UUID
  workspace_id: UUID
  user_id: UUID
  role: enum (Owner, Admin, Member)
  invited_at: timestamp
  joined_at: timestamp (nullable)
  status: enum (Active, Invited, Inactive)
}
```

#### 9.2 Billing & Subscription
**Plans (MVP):**
- **Starter:** $29/mo
  - 1 workspace
  - 3 team members (including owner)
  - 10 active clients
  - Basic funnels (5 funnels max)
  - Single invoices only
  - Basic workflows (5 workflows max)
  - 5 GB storage

- **Professional:** $99/mo
  - Unlimited workspaces (up to 5)
  - 20 team members per workspace
  - Unlimited clients
  - Unlimited funnels
  - Recurring invoices
  - Advanced workflows (50+ workflows)
  - 100 GB storage
  - Custom domain (client portal)
  - API access

- **Enterprise:** Custom pricing
  - Dedicated support
  - SSO (Single Sign-On)
  - Custom integrations
  - SLA (uptime guarantee)
  - Advanced reporting
  - Unlimited storage

**Billing Setup:**
- Stripe as primary payment processor
- Monthly or annual billing (10% discount for annual)
- Automatic renewal on billing date
- Failed payment retry logic (3 retries over 3 days)
- Downgrade allowed anytime (pro-rated refund if within billing month)

**Invoicing (SaaS):**
- System generates monthly invoice for each workspace
- Emailed to billing_email
- Viewable in workspace billing dashboard
- PDF download option

**Data Structure:**
```
Subscription {
  id: UUID
  workspace_id: UUID
  stripe_subscription_id: string
  stripe_customer_id: string
  plan_tier: enum (Starter, Professional, Enterprise)
  billing_email: string
  current_period_start: date
  current_period_end: date
  auto_renew: boolean
  status: enum (Active, Trialing, Cancelled, Suspended)
  created_at: timestamp
}

BillingHistory {
  id: UUID
  subscription_id: UUID
  invoice_date: date
  amount: decimal
  currency: string
  status: enum (Pending, Paid, Failed, Refunded)
  stripe_invoice_id: string (optional)
  created_at: timestamp
}

UsageMetrics {
  id: UUID
  workspace_id: UUID
  billing_month: date
  clients_count: integer
  invoices_sent: integer
  storage_used_gb: decimal
  api_calls: integer
  seats_used: integer
}
```

---

## User Flows

### Flow 1: Agency Owner Creates Onboarding Funnel
```
START
  ↓
Owner clicks "New Funnel"
  ↓
Modal: Enter funnel name ("Website Design Project"), description, save
  ↓
Redirect to Funnel Builder
  ↓
Add Step 1: Form
  - Add fields: company_name, budget, timeline, design_preferences
  - Mark as required / optional
  - Save
  ↓
Add Step 2: Contract
  - Upload PDF template or paste terms
  - Mark signature field
  - Save
  ↓
Add Step 3: Invoice
  - Create invoice: Website Design ($5,000), due in 7 days
  - Save
  ↓
Add Step 4: Automation
  - Action: Create Client (use form_data to populate name, email, etc.)
  - Action: Create Board Card in "Onboarding" column
  - Action: Send Chat Message ("Welcome to [Agency]! Your AM is Jordan.")
  - Action: Send Email (template: "account_ready") with portal link
  ↓
Publish Funnel → Generate public link
  ↓
Copy link, share with prospect via email/website
  ↓
END
```

### Flow 2: Prospect Completes Onboarding
```
START
  ↓
Prospect clicks onboarding link
  ↓
Lands on Step 1: Form
  - Fills questionnaire (company_name: "AF Marketing", budget: "$5K")
  - Uploads files (brand guidelines PDF)
  - Clicks "Next"
  ↓
Step 2: Contract
  - Reads contract
  - Checks "I Agree"
  - E-signs (types name or signature pad, advanced)
  - Clicks "Next"
  ↓
Step 3: Invoice
  - Sees invoice: "Website Design $5,000"
  - Clicks "Pay Now"
  ↓
Payment Page
  - Enters card details (Stripe form)
  - Clicks "Complete Payment"
  ↓
Stripe processes → success webhook
  ↓
Backend automation triggers:
  1. Create Client: name="AF Marketing", email=prospect_email
  2. Create Board Card: in "Onboarding" column, title="AF Marketing"
  3. Send Chat Message to new space: "Welcome!"
  4. Send Email: "Your account is ready" + portal login link
  ↓
Prospect receives email → clicks portal link
  ↓
Portal loads (magic link auto-login)
  ↓
Shows: Chat, Tasks (with kickoff list), Invoices, Files
  ↓
END
```

### Flow 3: Account Manager Weekly Check-in
```
START
  ↓
Jordan logs into workspace
  ↓
Dashboard: sees 15 active clients on various boards
  ↓
Clicks "AF Marketing" card on "Active" board
  ↓
Modal opens: Client card detail
  - Quick stats: 5 tasks, 3 recent messages, 2 files uploaded
  ↓
Clicks "Open Space" → portal loads
  ↓
Chat tab: views last 10 messages
  - Last message: "Design mockups ready for review"
  - Jordan types: "Great! Looks good, minor color tweak needed…"
  - Attaches screenshot with feedback
  ↓
Tasks tab: sees "Review Design Mockups" task, status "In Review"
  - Comments: "Please review asap"
  - Jordan adds comment: "Approved! Moving to next phase."
  - Changes status → "Done"
  ↓
Uses AI Bot: "@bot summarize AF Marketing last week"
  - Bot responds: "3 design mockups reviewed, 2 asset files uploaded, $3K invoice paid"
  ↓
Calendar tab: schedules next meeting
  - "Weekly Sync - AF Marketing"
  - Date: Friday 2 PM, attendees: Jordan + client contact
  - Adds Zoom link
  - Saves (calendar notification sent to attendee)
  ↓
Goes to Invoice tab: sees $2K invoice due Friday
  - Status: "Sent" (sent 2 days ago)
  - Clicks "Resend reminder" → email sent to client
  ↓
Leaves portal, returns to workspace
  ↓
END
```

### Flow 4: Client Pays Invoice
```
START
  ↓
Client receives email: "Invoice Ready: Website Design $5,000 - Due Nov 30"
  - Link in email: "Pay Now"
  ↓
Clicks link → portal payment page
  ↓
Sees invoice summary
  - Items: Website Design $5,000
  - Subtotal: $5,000
  - Tax (10%): $500
  - Total: $5,500
  ↓
Optional: enters discount code (if enabled)
  - Applies discount, total updates
  ↓
Enters card details
  - Card number, expiry, CVC
  ↓
Clicks "Pay $5,500"
  ↓
Stripe payment gateway processes
  - Secure 3D check (if needed)
  ↓
Success → Webhook POST to /api/webhooks/payment/stripe
  ↓
Backend handler:
  1. Create Payment record
  2. Update Invoice status → "Paid"
  3. Update Client status → "Active" (if first invoice)
  4. Trigger Workflow: "Invoice Paid"
     - Action: Send "Thank You" email
     - Action: Create task "Generate project brief"
  ↓
Client sees: "Payment Successful! Receipt will be emailed."
  ↓
Email sent to client: receipt + next steps
  ↓
AM sees notification: client payment confirmed
  ↓
END
```

---

## Data Model & Database Schema

### Entity Relationship Diagram (ERD)
```
Workspace
  ├── WorkspaceMember (role: Owner/Admin/Member)
  ├── User (workspace members)
  ├── ClientCompany
  │   ├── ClientContact
  │   ├── ClientSpace
  │   │   └── Conversation (messages)
  │   ├── Invoice
  │   │   ├── InvoiceItem
  │   │   └── Payment
  │   └── Card (board card for this client)
  ├── Board
  │   ├── BoardColumn
  │   └── Card (reference to ClientCompany)
  ├── Task
  │   ├── TaskComment
  │   └── TaskAttachment
  ├── Funnel
  │   ├── FunnelStep
  │   │   └── StepAction
  │   └── ClientOnboardingSession
  ├── Workflow
  │   └── WorkflowExecution
  ├── CalendarEvent
  │   └── CalendarEventAttendee
  └── Message (conversation messages)
```

### Drizzle ORM Schema (TypeScript)

```typescript
// Core: Workspace & Users
export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo_url: text("logo_url"),
  timezone: text("timezone").default("UTC"),
  subscription_tier: text("subscription_tier").default("starter"),
  subscription_status: text("subscription_status").default("active"),
  billing_email: text("billing_email"),
  created_by_user_id: uuid("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatar_url: text("avatar_url"),
  password_hash: text("password_hash"),
  created_at: timestamp("created_at").defaultNow(),
});

export const workspace_members = pgTable("workspace_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "owner" | "admin" | "member"
  status: text("status").default("active"), // "active" | "invited" | "inactive"
  invited_at: timestamp("invited_at"),
  joined_at: timestamp("joined_at"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  workspace_user_unique: uniqueIndex().on(table.workspace_id, table.user_id),
}));

// Clients
export const client_companies = pgTable("client_companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  company_name: text("company_name"),
  category: text("category"),
  description: text("description"),
  logo_url: text("logo_url"),
  status: text("status").default("lead"), // "lead" | "active" | "onboarding" | "completed" | "archived"
  contract_value: numeric("contract_value"),
  contract_start: date("contract_start"),
  contract_end: date("contract_end"),
  owner_user_id: uuid("owner_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const client_spaces = pgTable("client_spaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: uuid("client_id").notNull().references(() => client_companies.id, { onDelete: "cascade" }),
  public_url: text("public_url").notNull(),
  custom_domain: text("custom_domain"),
  logo_url: text("logo_url"),
  branding: json("branding"), // { primary_color, accent_color, font_family }
  password_hash: text("password_hash"),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

// Boards & Tasks
export const boards = pgTable("boards", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  board_type: text("board_type"), // "sales" | "onboarding" | "delivery" | "custom"
  created_at: timestamp("created_at").defaultNow(),
});

export const board_columns = pgTable("board_columns", {
  id: uuid("id").primaryKey().defaultRandom(),
  board_id: uuid("board_id").notNull().references(() => boards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order"),
  wip_limit: integer("wip_limit"),
  collapsed: boolean("collapsed").default(false),
});

export const cards = pgTable("cards", {
  id: uuid("id").primaryKey().defaultRandom(),
  column_id: uuid("column_id").notNull().references(() => board_columns.id, { onDelete: "cascade" }),
  client_id: uuid("client_id").references(() => client_companies.id, { onDelete: "setNull" }),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order"),
  due_date: date("due_date"),
  created_at: timestamp("created_at").defaultNow(),
  moved_at: timestamp("moved_at"),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: uuid("client_id").references(() => client_companies.id, { onDelete: "setNull" }),
  card_id: uuid("card_id").references(() => cards.id, { onDelete: "setNull" }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("todo"), // "todo" | "inprogress" | "inreview" | "done"
  priority: text("priority").default("medium"), // "low" | "medium" | "high"
  due_date: date("due_date"),
  assignee_ids: text("assignee_ids"), // JSON array of UUID strings
  tags: text("tags"), // JSON array
  visibility: text("visibility").default("internal"), // "internal" | "client_visible"
  created_by_user_id: uuid("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

export const task_comments = pgTable("task_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  task_id: uuid("task_id").notNull().references(() => tasks.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Invoicing
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_id: uuid("client_id").notNull().references(() => client_companies.id, { onDelete: "cascade" }),
  invoice_number: text("invoice_number").notNull(),
  currency: text("currency").default("USD"),
  amount_subtotal: numeric("amount_subtotal").notNull(),
  discount_amount: numeric("discount_amount"),
  discount_percentage: numeric("discount_percentage"),
  tax_rate: numeric("tax_rate"),
  tax_amount: numeric("tax_amount"),
  total_amount: numeric("total_amount").notNull(),
  status: text("status").default("draft"), // "draft" | "sent" | "paid" | "overdue" | "archived"
  due_date: date("due_date").notNull(),
  issued_date: date("issued_date").notNull(),
  paid_date: date("paid_date"),
  notes: text("notes"),
  created_by_user_id: uuid("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  invoice_number_unique: uniqueIndex().on(table.workspace_id, table.invoice_number),
}));

export const invoice_items = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_id: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unit_price: numeric("unit_price").notNull(),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoice_id: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  gateway: text("gateway").notNull(), // "stripe" | "midtrans" | "xendit"
  gateway_payment_id: text("gateway_payment_id").notNull(),
  amount: numeric("amount").notNull(),
  currency: text("currency").notNull(),
  status: text("status").default("pending"), // "pending" | "completed" | "failed" | "refunded"
  paid_at: timestamp("paid_at"),
  metadata: json("metadata"),
  created_at: timestamp("created_at").defaultNow(),
});

// Funnels
export const funnels = pgTable("funnels", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  public_url: text("public_url").notNull(),
  published: boolean("published").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
}, (table) => ({
  public_url_unique: uniqueIndex().on(table.workspace_id, table.public_url),
}));

export const funnel_steps = pgTable("funnel_steps", {
  id: uuid("id").primaryKey().defaultRandom(),
  funnel_id: uuid("funnel_id").notNull().references(() => funnels.id, { onDelete: "cascade" }),
  step_type: text("step_type").notNull(), // "form" | "contract" | "invoice" | "automation"
  order: integer("order").notNull(),
  config: json("config").notNull(), // field definitions, template
});

export const client_onboarding_sessions = pgTable("client_onboarding_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  funnel_id: uuid("funnel_id").notNull().references(() => funnels.id, { onDelete: "cascade" }),
  client_email: text("client_email").notNull(),
  current_step: integer("current_step").default(0),
  progress_data: json("progress_data"), // { form_responses, contract_signed, etc. }
  magic_link_token: text("magic_link_token"),
  created_at: timestamp("created_at").defaultNow(),
  completed_at: timestamp("completed_at"),
});

// Workflows
export const workflows = pgTable("workflows", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  trigger: json("trigger").notNull(), // { type, config }
  actions: json("actions").notNull(), // array of { type, config }
  enabled: boolean("enabled").default(true),
  created_by_user_id: uuid("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Chat & Messages
export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  client_space_id: uuid("client_space_id").references(() => client_spaces.id, { onDelete: "cascade" }),
  title: text("title"),
  created_at: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
  deleted_at: timestamp("deleted_at"),
});

// Calendar
export const calendar_events = pgTable("calendar_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  all_day: boolean("all_day").default(false),
  location: text("location"),
  video_link: text("video_link"),
  created_by_user_id: uuid("created_by_user_id").references(() => users.id),
  created_at: timestamp("created_at").defaultNow(),
});

export const calendar_event_attendees = pgTable("calendar_event_attendees", {
  id: uuid("id").primaryKey().defaultRandom(),
  event_id: uuid("event_id").notNull().references(() => calendar_events.id, { onDelete: "cascade" }),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "setNull" }),
  email: text("email"),
  rsvp_status: text("rsvp_status").default("pending"), // "pending" | "accepted" | "declined"
});
```

---

## Technical Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Pages: Dashboard, Funnels, Clients, Boards, Tasks        │ │
│  │ • Components: Kanban, Form Builder, Invoice UI             │ │
│  │ • State: TanStack Query (React Query), Zustand             │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓ (HTTP/WebSocket)
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API (Next.js API Routes)             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • Auth: BetterAuth (OAuth, email, passwordless)            │ │
│  │ • Routes: /api/workspaces, /api/clients, /api/tasks, etc.  │ │
│  │ • Middleware: CORS, rate limit, auth check, validation     │ │
│  │ • WebSocket: Real-time chat via Socket.io or alternative   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE (PostgreSQL)                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ • ORM: Drizzle                                             │ │
│  │ • Migrations: Version-controlled schema updates            │ │
│  │ • Connection Pool: Node.js pg pool for concurrency         │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Tech Stack (MVP)
- **Frontend:** Next.js 14+ (App Router), React 18+, TypeScript
- **Styling:** Tailwind CSS, shadcn/ui components
- **State:** TanStack Query (data fetching), Zustand (client state)
- **Forms:** React Hook Form + Zod (validation)
- **Auth:** BetterAuth (JWT, session management)
- **Backend:** Next.js API Routes, TypeScript
- **Database:** PostgreSQL 14+ (managed service: Supabase, Neon, Railway, etc.)
- **ORM:** Drizzle
- **Payment Gateway:** Stripe API (+ Midtrans/Xendit client libraries)
- **LLM Integration:** OpenAI SDK / Anthropic SDK
- **File Storage:** S3 (AWS) or Cloudinary
- **Hosting:** Vercel (frontend + API), Railway or Render (DB)
- **Email:** Resend or SendGrid
- **Real-time:** Socket.io or Supabase Realtime

### Folder Structure
```
.
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── workspaces/
│   │   ├── clients/
│   │   ├── tasks/
│   │   ├── invoices/
│   │   ├── funnels/
│   │   ├── workflows/
│   │   ├── webhooks/
│   │   │   ├── stripe/
│   │   │   └── midtrans/
│   │   └── middleware.ts
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── funnels/
│   │   ├── clients/
│   │   ├── boards/
│   │   ├── tasks/
│   │   ├── invoices/
│   │   └── calendar/
│   └── client-portal/
│       └── [slug]/
│           └── layout.tsx
├── components/
│   ├── ui/ (shadcn/ui base components)
│   ├── board/ (Kanban components)
│   ├── invoice/ (Invoice UI)
│   ├── funnel/ (Funnel builder)
│   └── client/ (Client portal)
├── lib/
│   ├── db/ (Drizzle schema, migrations)
│   ├── auth.ts (BetterAuth setup)
│   ├── api-client.ts (Fetch wrapper)
│   ├── validators.ts (Zod schemas)
│   └── utils.ts
├── hooks/
│   ├── useWorkspace.ts
│   ├── useClients.ts
│   ├── useTasks.ts
│   └── ...
├── store/ (Zustand stores)
│   ├── workspaceStore.ts
│   └── uiStore.ts
├── types/
│   └── index.ts (TypeScript type definitions)
├── env.local (environment variables)
├── drizzle.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

### CI/CD Pipeline
- **Git:** GitHub
- **CI:** GitHub Actions
  - Lint & format check (ESLint, Prettier)
  - TypeScript type check
  - Unit tests (Jest / Vitest)
  - E2E tests (Playwright) on PR
- **Deployment:** Vercel (auto-deploy on main branch) + Railway/Render for DB migrations

---

## API Endpoints (Overview)

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh-token
```

### Workspaces
```
GET    /api/workspaces
POST   /api/workspaces
GET    /api/workspaces/:id
PATCH  /api/workspaces/:id
POST   /api/workspaces/:id/members
DELETE /api/workspaces/:id/members/:memberId
```

### Clients
```
GET    /api/workspaces/:workspaceId/clients
POST   /api/workspaces/:workspaceId/clients
GET    /api/workspaces/:workspaceId/clients/:clientId
PATCH  /api/workspaces/:workspaceId/clients/:clientId
DELETE /api/workspaces/:workspaceId/clients/:clientId
```

### Client Portal
```
GET    /api/client-portal/:spaceSlug
POST   /api/client-portal/:spaceSlug/login
GET    /api/client-portal/:spaceSlug/tasks
GET    /api/client-portal/:spaceSlug/invoices
POST   /api/client-portal/:spaceSlug/messages
```

### Boards & Tasks
```
GET    /api/workspaces/:workspaceId/boards
POST   /api/workspaces/:workspaceId/boards
GET    /api/workspaces/:workspaceId/boards/:boardId
PATCH  /api/workspaces/:workspaceId/boards/:boardId/columns/:columnId
GET    /api/workspaces/:workspaceId/tasks
POST   /api/workspaces/:workspaceId/tasks
PATCH  /api/workspaces/:workspaceId/tasks/:taskId
```

### Invoices
```
GET    /api/workspaces/:workspaceId/invoices
POST   /api/workspaces/:workspaceId/invoices
GET    /api/workspaces/:workspaceId/invoices/:invoiceId
PATCH  /api/workspaces/:workspaceId/invoices/:invoiceId
POST   /api/workspaces/:workspaceId/invoices/:invoiceId/send
POST   /api/workspaces/:workspaceId/invoices/:invoiceId/payment-link
```

### Funnels
```
GET    /api/workspaces/:workspaceId/funnels
POST   /api/workspaces/:workspaceId/funnels
GET    /api/workspaces/:workspaceId/funnels/:funnelId
PATCH  /api/workspaces/:workspaceId/funnels/:funnelId
POST   /api/funnels/:funnelPublicUrl/submit-step
GET    /api/funnels/:funnelPublicUrl (public, no auth)
```

### Workflows
```
GET    /api/workspaces/:workspaceId/workflows
POST   /api/workspaces/:workspaceId/workflows
PATCH  /api/workspaces/:workspaceId/workflows/:workflowId
DELETE /api/workspaces/:workspaceId/workflows/:workflowId
```

### Chat & Messages
```
GET    /api/workspaces/:workspaceId/conversations
GET    /api/workspaces/:workspaceId/conversations/:conversationId/messages
POST   /api/workspaces/:workspaceId/conversations/:conversationId/messages
```

### Webhooks (Incoming)
```
POST   /api/webhooks/stripe/checkout.session.completed
POST   /api/webhooks/midtrans/payment-notification
POST   /api/webhooks/xendit/payment-notification
```

---

## Non-Functional Requirements

### Performance
- **Page Load:** <2 seconds (First Contentful Paint)
- **List Load:** <1 second for 500+ items (pagination 50 items/page)
- **Search:** <500ms for global search across 10K+ items
- **Animations:** Smooth 60 FPS (no jank)
- **API Response Time:** <200ms for 95th percentile

### Scalability
- **Concurrent Users:** Support 1K–10K concurrent DAU per deployment
- **Horizontal Scaling:** Stateless API (can add replicas behind load balancer)
- **Database:** Connection pooling, read replicas for scaling reads
- **File Storage:** S3 scaling, CDN for file delivery

### Availability
- **SLA:** 99.5% uptime (Starter/Pro), 99.9% (Enterprise)
- **Disaster Recovery:** DB backups daily, point-in-time recovery
- **Failover:** Auto-failover for critical services (payment, auth)

### Security
- **Authentication:** JWT with refresh tokens, BetterAuth
- **Authorization:** Role-based access control (RBAC) at API level
- **Data Encryption:** TLS in transit, AES-256 at rest (DB encryption)
- **PCI DSS:** No storage of raw card data (Stripe tokenization)
- **Audit Logging:** User actions logged (create, update, delete)
- **Rate Limiting:** 100 req/min per user, 1000 req/min per IP

### Reliability
- **Error Handling:** Graceful degradation, user-friendly error messages
- **Monitoring:** Error tracking (Sentry), performance monitoring (Datadog)
- **Alerting:** Critical alerts (payment failure, DB down) to team Slack
- **Testing:** Unit tests (80% coverage), E2E tests for critical flows

---

## Security & Compliance

### Data Privacy
- **GDPR:** Comply with data retention (clients can request data export/deletion)
- **Data Residency:** Store data in region of choice (US, EU, Asia)
- **Encryption:** End-to-end for sensitive data (payment info tokenized)

### Payment Security
- **PCI DSS Level 1:** Use Stripe (outsource compliance)
- **No Raw Card Storage:** Use Stripe tokens for repeat payments
- **3D Secure:** For high-value transactions

### Access Control
- **User Roles:** Owner (full), Admin (all except billing), Member (limited), Client (read-only)
- **Workspace Isolation:** Data completely isolated per workspace (multi-tenancy)
- **Audit Trail:** Log all sensitive actions (invoice deletion, user role change, etc.)

### Compliance
- **SOC 2:** Target SOC 2 Type II certification (Year 2)
- **GDPR:** Data processing agreements (DPA) for Enterprise customers
- **CCPA:** Right to deletion, data portability

---

## Analytics & Success Metrics

### Primary Metrics
| Metric | Target | Method |
|--------|--------|--------|
| **Monthly Active Users (MAU)** | 500 (Month 3) → 5K (Month 12) | Dashboard user count |
| **Customer Acquisition Cost (CAC)** | <$200 | Marketing spend / new customers |
| **Churn Rate** | <5% monthly | (Churned / Start of month) |
| **Net Revenue Retention** | >100% | (Starting ARR + expansion - churn) / starting ARR |
| **Free Trial Conversion** | >15% | Free trial → paid subscribers |
| **Time to Onboard** | <2 hours (avg) | Session duration (public funnel) |

### Secondary Metrics
| Metric | Target | Method |
|--------|--------|--------|
| **Average Revenue per User (ARPU)** | $50–80 | Total MRR / MAU |
| **Feature Adoption** | >60% for funnels, >70% for tasks | Feature usage % of active users |
| **Support Ticket Response Time** | <4 hours | Help desk SLA |
| **System Uptime** | 99.5% | Monitoring via Uptime Robot |
| **Customer NPS** | >40 | Monthly NPS survey |

### Engagement Metrics
| Metric | Target | Tracking |
|--------|--------|----------|
| **Daily Active Users (DAU)** | DAU/MAU ratio >40% | Analytics event on login |
| **Average Session Duration** | >15 min | GA / custom analytics |
| **Feature Usage (Funnels)** | >70% create funnel | Event tracking |
| **Feature Usage (Invoices)** | >80% create invoice | Event tracking |
| **Referral Rate** | >20% new customers via referral | Ref link tracking |

---

## Development Roadmap

### Phase 1: MVP (Weeks 1–16)
**v0.1 – Auth & Workspace** (Week 1–2)
- [ ] Workspace creation & signup
- [ ] BetterAuth integration
- [ ] Role-based access (Owner, Member, Client)
- [ ] User invitation & management

**v0.2 – Client Management** (Week 3–4)
- [ ] Client list (CRUD)
- [ ] Client detail page
- [ ] Client space (portal) basic structure
- [ ] Client login (magic link)

**v0.3 – Boards & Tasks** (Week 5–6)
- [ ] Board creation & editing
- [ ] Kanban columns & cards
- [ ] Drag-and-drop functionality
- [ ] Task creation, assignment, status change

**v0.4 – Invoices** (Week 7–9)
- [ ] Invoice creation form
- [ ] Invoice list & detail view
- [ ] PDF generation
- [ ] Email invoice to client
- [ ] Payment gateway integration (Stripe)

**v0.5 – Funnels** (Week 10–12)
- [ ] Funnel builder (Form, Contract, Invoice steps)
- [ ] Public funnel link & session tracking
- [ ] Auto client creation on funnel completion
- [ ] Funnel step automation (send email, create task)

**v0.6 – Chat & Portal** (Week 13–14)
- [ ] Per-client chat
- [ ] Client portal tasks tab
- [ ] Client portal files tab
- [ ] Client portal invoices tab

**v0.7 – Workflows & Polish** (Week 15–16)
- [ ] Basic workflow builder
- [ ] Workflow triggers & actions
- [ ] Calendar basic view
- [ ] Bug fixes, performance optimization
- [ ] Documentation & launch prep

**v0.8 – QA & Public Beta Launch** (Week 17–18)
- [ ] User acceptance testing
- [ ] Bug fixes
- [ ] Launch announcement
- [ ] Early customer onboarding

### Phase 2: Stabilization & Early Features (Month 6–9)
**v1.0 – Public Release**
- [ ] SaaS billing setup (Starter, Pro plans)
- [ ] Stripe billing portal
- [ ] Usage metrics per plan
- [ ] Support ticketing integration (Zendesk / Intercom)
- [ ] AI assistant v1 (GPT-3.5 integration, task/invoice Q&A)
- [ ] Calendar booking (basic, non-public)
- [ ] Email template library
- [ ] Dashboard analytics (revenue, clients, tasks)

### Phase 3: Advanced Features (Month 10–16)
**v1.5 – Website Builder & Recurring Invoices**
- [ ] Page builder (drag-drop, templates)
- [ ] Publish to subdomain / custom domain
- [ ] Link onboarding funnel to site
- [ ] Recurring invoices (monthly, quarterly)
- [ ] Subscription billing management

**v2.0 – Integrations & AI**
- [ ] Zapier / Make.com integration
- [ ] Slack integration (notifications, commands)
- [ ] Advanced workflows (conditions, delays, parallel actions)
- [ ] Brain / knowledge base (document indexing, content gen)
- [ ] Public booking calendar (Calendly competitor)
- [ ] Custom domain support (client portal white-label)

---

## Go-to-Market Strategy

### Target Acquisition Channels
1. **Product Hunt Launch** (Week 16–17)
   - Target: 500+ upvotes, top 10 for the day
   - Effort: Teaser email to early access list, press kit, product demo video

2. **LinkedIn & Indie Hackers** (Ongoing)
   - Content: Case studies, how-to guides, agency tips
   - Ads: Retargeting engaged visitors

3. **Agencies.com Directory** (Month 5–6)
   - List as tool for agencies
   - Target: 50+ organic signups/month

4. **Partnerships & Referrals** (Month 6+)
   - Partner with design/marketing agencies as white-label option
   - Referral program: $300 per referred customer (annual plan)

5. **Content Marketing** (Month 3+)
   - Blog: "Client Onboarding Checklist", "5 Tools Every Agency Uses"
   - Videos: Funnel builder tutorial, portal demo, ROI calculator
   - SEO: Target keywords: "client onboarding software", "agency management tool"

### Pricing & Positioning
- **Freemium Model:** 14-day free trial (no credit card needed)
- **Positioning:** "The operating system for client-facing teams"
- **Competitor Positioning:** Faster setup than competitors, more integrated than Notion + Stripe combo

### Sales & Support
- **Onboarding:** In-app onboarding tutorial, welcome email series
- **Support:** In-app chat + email (first month), knowledge base
- **Account Success:** Monthly check-ins for Pro customers, quarterly for Enterprise

---

## Appendix

### Glossary
- **Workspace:** A multi-tenant container for an agency (its clients, team, data)
- **Client Space:** A dedicated portal for each client to access tasks, invoices, chat
- **Funnel:** A visual onboarding journey (steps: form → contract → payment)
- **Board:** A Kanban board (columns, cards, drag-drop pipeline)
- **Workflow:** An automation rule (trigger → actions)
- **RBAC:** Role-Based Access Control (permissions by role)

### References
- Competitors: Notion, Asana, Trello, Calendly, HubSpot
- Competitors: Notion, Asana, Trello, Calendly, HubSpot
- Tech: Next.js docs, Drizzle docs, Stripe API docs

### Revision History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Nov 27, 2025 | Product Team | Initial PRD |

---

## Sign-Off

**Product Manager:** [Your Name]  
**Engineering Lead:** [Your Name]  
**Design Lead:** [Your Name]  
**Stakeholder:** [Your Name]  

**Approved:** [Date]

---

*Document Status: Draft | Last Updated: November 27, 2025*
