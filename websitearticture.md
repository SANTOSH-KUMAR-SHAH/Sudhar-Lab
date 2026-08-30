# Sudhar Lab — Website Architecture Migration Superprompt

## Purpose

Use this as the master prompt for an AI coding agent working on the existing **LocalHelp / Sudhar Lab** repository.

The goal is **not** to delete the existing project and rebuild it from zero.

The goal is to **evolve the current working application step-by-step** into the appliance-service-management system described by the teacher's diagrams and requirements.

The existing project came from a simpler service-booking repository, so some terminology and architecture currently reflect that origin. Reuse what is useful and gradually replace incomplete business logic.

---

# 1. THE CORE IDEA

The target system should manage the **entire lifecycle of an appliance repair**, not merely an appointment.

Real-world example:

> A customer owns a Samsung washing machine. It develops a problem. The customer reports it. The administrator coordinates the job. A technician is assigned, visits, diagnoses the appliance, creates an estimate if needed, the customer approves it, repair happens, parts may be required, an invoice is created, payment is made, feedback is collected, and the request is finally closed.

The central relationship becomes:

```text
Customer
  ↓
Appliance
  ↓
Service Request
  ↓
Appointment
  ↓
Technician
  ↓
Diagnosis
  ↓
Estimate
  ↓
Customer Approval
  ↓
Repair / Parts
  ↓
Completion
  ↓
Invoice
  ↓
Payment
  ↓
Feedback / Warranty
  ↓
Closed
```

---

# 2. CURRENT SYSTEM VS TARGET SYSTEM

## Current application

The current LocalHelp system is approximately:

```text
Customer
  ↓
Browse Service
  ↓
Choose Technician
  ↓
Choose Slot
  ↓
Payment
  ↓
Technician Accepts
  ↓
Technician Completes
  ↓
Review
```

It is therefore closer to a service-booking marketplace.

## Target application

The target system is:

```text
Customer
  ↓
Register / Select Appliance
  ↓
Describe Problem
  ↓
Create Service Request
  ↓
Administrator Reviews
  ↓
Administrator Checks Availability
  ↓
Administrator Assigns Technician
  ↓
Technician Accepts
  ↓
Appointment Confirmed
  ↓
Technician On Way
  ↓
Diagnosing
  ↓
Estimate if Required
  ↓
Customer Approves / Rejects
  ↓
In Progress
  ↓
Waiting for Parts ↔ In Progress
  ↓
Completed
  ↓
Invoiced
  ↓
Paid
  ↓
Closed
```

Also:

```text
Requested → Cancelled
```

when the customer withdraws the request.

---

# 3. VERY IMPORTANT: DO NOT PANIC OR REWRITE EVERYTHING

The repository already contains valuable working functionality:

- Authentication
- Customer accounts
- Provider/technician accounts
- Admin account
- Categories
- Services
- Scheduling
- Booking logic
- Notifications
- Reviews
- Addresses
- Dashboards
- Nepal localization
- Prisma
- PostgreSQL/Neon support
- Mock fallback
- Responsive frontend
- Existing design system

Do **not** throw these away.

Instead:

1. Inspect the repository.
2. Understand the current architecture.
3. Map current objects to target concepts.
4. Identify what can be reused.
5. Add missing domain concepts.
6. Migrate the workflow incrementally.
7. Keep the application buildable throughout.

---

# 4. TARGET BUSINESS MODEL

The product should behave like a **professional appliance repair/service management platform**.

The central business object should become:

> **Service Request**

rather than simply:

> Booking

A booking/appointment can still exist, but it becomes part of a larger service request.

Think:

```text
Service Request = "My appliance needs service."

Appointment = "The technician will visit at this time."
```

Therefore:

```text
Service Request
      ↓
Appointment
      ↓
Technician Visit
```

---

# 5. ACTORS

The teacher's system has three primary human roles:

## Customer

Can:

- Register
- Login
- Manage profile
- Register owned appliances
- Select an appliance
- Create service request
- Describe problem
- View service-request status
- View appointments
- Receive notifications
- View diagnosis
- View estimates
- Approve/reject estimates
- View invoices
- Make payment
- View service history
- Give feedback

## Administrator

Operates the service platform:

- Manage customers
- Manage technicians
- Review service requests
- Check technician availability
- Assign technicians
- Reschedule when necessary
- Manage appointments
- Monitor service requests
- Manage spare parts
- Manage warranty information
- Manage payments
- Generate reports
- Review feedback

## Technician

Performs technical work:

- View assigned jobs
- Accept assigned jobs
- View appointment/customer/appliance details needed for the job
- Start service
- Diagnose appliance
- Record diagnosis
- Create estimate when necessary
- Update service status
- Add/use spare parts
- Continue repair after parts arrive
- Complete service
- Receive notifications

The System itself handles:

- Authentication
- Authorization
- Validation
- Notifications
- Status transitions
- Invoice/payment processing
- History
- Reporting

---

# 6. THE SERVICE REQUEST LIFECYCLE

Use the teacher's lifecycle as the primary target:

```text
REQUESTED
   ↓
ASSIGNED
   ↓
CONFIRMED
   ↓
TECHNICIAN_ON_WAY
   ↓
DIAGNOSING
   ↓
IN_PROGRESS
   ↓
WAITING_FOR_PARTS
   ↓
IN_PROGRESS
   ↓
COMPLETED
   ↓
INVOICED
   ↓
PAID
   ↓
CLOSED
```

Cancellation:

```text
REQUESTED → CANCELLED
```

Do not allow arbitrary status changes.

For example, a customer must not be able to do:

```text
REQUESTED → COMPLETED
```

through a frontend hack.

Backend authorization and transition validation must enforce the lifecycle.

---

# 7. LEGAL TRANSITION MODEL

A clean implementation should enforce something similar to:

```text
REQUESTED
 ├── ASSIGNED
 └── CANCELLED

ASSIGNED
 └── CONFIRMED

CONFIRMED
 └── TECHNICIAN_ON_WAY

TECHNICIAN_ON_WAY
 └── DIAGNOSING

DIAGNOSING
 └── IN_PROGRESS

IN_PROGRESS
 ├── WAITING_FOR_PARTS
 └── COMPLETED

WAITING_FOR_PARTS
 └── IN_PROGRESS

COMPLETED
 └── INVOICED

INVOICED
 └── PAID

PAID
 └── CLOSED
```

The exact implementation may be adjusted after inspecting the existing code, but the teacher's lifecycle must remain the conceptual source of truth.

---

# 8. CUSTOMER FLOW

## Step 1 — Login

Customer logs in.

System validates credentials.

## Step 2 — Appliance

Customer selects an existing appliance or registers one.

Example:

```text
Type: Washing Machine
Brand: Samsung
Model: WW70T
Serial Number: XXXXX
Purchase Date: ...
Warranty: ...
```

Do not invent detailed warranty policies that have not been defined.

## Step 3 — Problem

Customer enters:

> "Washing machine turns on but does not spin."

## Step 4 — Create request

System creates:

```text
ServiceRequest
status = REQUESTED
```

Administrator is notified.

---

# 9. ADMINISTRATOR FLOW

Admin sees the new request.

Example:

```text
Request #SL-1024

Customer:
Santosh

Appliance:
Samsung Washing Machine

Problem:
Machine turns on but does not spin.

Status:
Requested
```

Admin reviews it.

Admin checks technician availability.

If a technician is available:

```text
Assign Technician
```

The request becomes:

```text
ASSIGNED
```

If no appropriate technician is available:

```text
Reschedule
```

Do not force an unavailable technician into a job.

---

# 10. TECHNICIAN FLOW

Technician sees:

```text
Assigned Jobs
```

They open the request and see relevant:

- Customer
- Appliance
- Problem
- Appointment
- Location

Technician accepts.

The request becomes:

```text
CONFIRMED
```

Customer receives a notification.

When technician starts travelling:

```text
CONFIRMED
→ TECHNICIAN_ON_WAY
```

Real GPS tracking is **not required** unless later specified. A status update is enough for the first implementation.

---

# 11. DIAGNOSIS

When the technician arrives:

```text
TECHNICIAN_ON_WAY
→ DIAGNOSING
```

Technician records diagnosis.

Example:

```text
Diagnosis:
Drain pump is damaged.

Observed:
Machine powers on but does not drain.

Recommended:
Replace drain pump.
```

The diagnosis must remain attached to the service request and service history.

---

# 12. ESTIMATE

After diagnosis:

```text
Estimate Required?
```

If no estimate is required:

```text
DIAGNOSING
→ IN_PROGRESS
```

If required:

```text
Create Estimate
→ Customer reviews
→ Approve / Reject
```

Example:

```text
Labour       Rs. 1,000
Drain Pump   Rs. 2,500
Other        Rs. 0
--------------------
Total        Rs. 3,500
```

Do not hardcode those numbers.

Calculate the total from actual estimate items.

---

# 13. CUSTOMER ESTIMATE APPROVAL

Customer receives notification.

Customer sees:

```text
Diagnosis
Estimate Items
Total
```

Customer chooses:

```text
APPROVE
```

or:

```text
REJECT
```

The decision must be recorded.

Do not silently assume approval.

If an estimate is required and has not been approved, the system should not allow the repair to progress as though it were approved.

The exact consequence of rejection should remain configurable until the business rule is formally defined.

---

# 14. REPAIR + SPARE PARTS

After approval:

```text
IN_PROGRESS
```

If parts are needed:

```text
IN_PROGRESS
→ WAITING_FOR_PARTS
```

When parts become available:

```text
WAITING_FOR_PARTS
→ IN_PROGRESS
```

This loop is a core requirement.

The system should eventually represent:

```text
Part
Quantity
Unit Price
Availability
Usage on Service Request
```

Do not invent a complex inventory system before it is needed.

---

# 15. COMPLETION

When repair is finished:

```text
IN_PROGRESS
→ COMPLETED
```

Technician should be able to record relevant completion information.

Preserve:

- Customer
- Appliance
- Technician
- Diagnosis
- Estimate
- Parts used
- Work performed
- Final amount
- Completion date

---

# 16. INVOICE

After completion:

```text
COMPLETED
→ INVOICED
```

The invoice should be based on the actual service transaction.

Conceptually:

```text
Labour
+ Parts
+ Other approved charges
-------------------------
Subtotal
+ any formally defined fees/taxes
-------------------------
Total
```

Do not invent tax rates, commissions, or charges unless the project defines them.

---

# 17. PAYMENT

Target flow:

```text
INVOICED
→ PAYMENT
→ PAID
```

The teacher's requirements say payment is through an external trusted payment gateway.

The current project has a fake/demo payment UI.

Keep the demo layer if useful, but architect it so real integration can replace it later.

Never claim that a simulated payment is a real payment.

Nepal localization should remain, including the existing eSewa/Khalti/IME Pay/Fonepay and Nepal-bank concepts where applicable.

---

# 18. CLOSING

After payment:

```text
PAID
→ CLOSED
```

Feedback can be collected around completion/payment according to the final business rule.

The complete history must remain available.

---

# 19. APPLIANCE IS A FIRST-CLASS ENTITY

One of the teacher's explicit assumptions is:

> One appliance may generate multiple service requests over time.

Therefore:

```text
Customer
   ↓
Many Appliances

Appliance
   ↓
Many Service Requests
```

Example:

```text
Samsung Washing Machine

 ├── Request #1 — Drain problem
 ├── Request #2 — Motor problem
 └── Request #3 — Spin problem
```

Do NOT make an appliance exist only inside one booking.

Historical service records should remain connected to the appliance.

---

# 20. IMPORTANT DATA RELATIONSHIPS

Conceptually:

```text
One Customer
    ↓
Many Appliances

One Appliance
    ↓
Many Service Requests

One Service Request
    ↓
One Appointment (as appropriate)

One Service Request
    ↓
One Diagnosis

One Service Request
    ↓
One Invoice
```

The teacher's assumption specifically describes one request as having one diagnosis and one invoice.

---

# 21. SERVICE HISTORY

The system should eventually preserve a timeline such as:

```text
2026-08-30
Service Requested

2026-08-30
Technician Assigned

2026-08-30
Appointment Confirmed

2026-08-30
Technician On Way

2026-08-30
Diagnosis Added

2026-08-30
Estimate Approved

2026-08-30
Repair Completed

2026-08-30
Invoice Generated

2026-08-30
Payment Received

2026-08-30
Request Closed
```

A status-history entity/table is a strong architectural candidate:

```text
requestId
fromStatus
toStatus
changedBy
changedAt
note
```

Use this if it fits the existing architecture.

---

# 22. DATABASE MIGRATION STRATEGY

First inspect the existing `schema.prisma`.

Do not blindly rename every existing model.

Existing models such as:

```text
User
ProviderProfile
ProviderService
ServiceCategory
ServiceSubCategory
Booking
Review
Report
Notification
Address
```

contain useful functionality.

Potential new concepts include:

```text
Appliance
ServiceRequest
Appointment
Diagnosis
Estimate
EstimateItem
SparePart
PartUsage
Invoice
InvoiceItem
Payment
Warranty
StatusHistory
```

These are **architectural candidates**, not instructions to create unnecessary tables.

Use the smallest clean model that correctly represents the teacher's workflow.

---

# 23. CURRENT → TARGET MAPPING

| Current concept | Target concept |
|---|---|
| Booking | Service Request + Appointment |
| Provider | Technician |
| ProviderService | Technician capability/service |
| Customer chooses provider | Admin assigns technician |
| Booking PENDING | Service Request REQUESTED |
| Booking ACCEPTED | Service Request CONFIRMED |
| Booking COMPLETED | Service Request COMPLETED |
| Payment at booking | Invoice → Payment after service |
| Provider dashboard | Technician dashboard |
| Admin dashboard | Operations dashboard |
| Review | Service feedback |
| Notification | Keep and expand |
| Address | Keep and associate with request/appliance where appropriate |
| Category | Keep as service/appliance classification |

Do not perform cosmetic renaming if it creates unnecessary risk.

Correct behavior matters more than naming everything perfectly on day one.

---

# 24. ADMINISTRATOR IS NOW AN OPERATIONS ROLE

The admin should not only manage users.

The admin is responsible for coordinating:

```text
Service Requests
Appointments
Technicians
Customers
Appliances
Spare Parts
Invoices
Payments
Warranty
Reports
Feedback
```

The most important admin area should eventually be:

> **Service Requests**

because that is where the operation begins.

---

# 25. CUSTOMER DASHBOARD TARGET

Evolve the current profile/dashboard toward:

```text
My Appliances
Service Requests
Upcoming Appointments
Active Repairs
Estimates Awaiting Approval
Invoices
Payments
Service History
Feedback
```

A customer should be able to open an appliance and see its repair history.

---

# 26. TECHNICIAN DASHBOARD TARGET

Evolve the current provider dashboard toward:

```text
Today's Jobs
Assigned Requests
Upcoming Appointments
Active Repair
Waiting for Parts
Completed Jobs
Service History
```

Technicians should only see and modify jobs they are authorized to access.

---

# 27. ADMIN DASHBOARD TARGET

Evolve the current admin dashboard toward:

```text
Overview
Service Requests
Appointments
Technicians
Customers
Appliances
Spare Parts
Invoices
Payments
Warranty
Reports
Feedback
```

Do not build all sections at once.

Prioritize service-request operations first.

---

# 28. SERVICE REQUEST DETAIL PAGE

This should eventually become a central page.

Example:

```text
SERVICE REQUEST #SL-1024

STATUS
Diagnosing

CUSTOMER
Santosh

APPLIANCE
Samsung Washing Machine
Model: WW70T

PROBLEM
Machine turns on but does not spin.

APPOINTMENT
Today — 3:00 PM

TECHNICIAN
Ramesh Sharma

DIAGNOSIS
Drain pump appears damaged.

ESTIMATE
Rs. 3,500
[Approve] [Reject]

TIMELINE
✓ Requested
✓ Assigned
✓ Confirmed
✓ Technician On Way
● Diagnosing
○ In Progress
○ Completed
○ Invoiced
○ Paid
○ Closed
```

The UI should make the service lifecycle obvious.

---

# 29. TECHNICIAN JOB DETAIL

Eventually:

```text
JOB #SL-1024

Customer
Appliance
Problem
Location
Appointment

Status: Confirmed

[On My Way]

After arrival:

[Start Diagnosis]

Diagnosis:
[textarea]

[Save Diagnosis]

Estimate:
[Create Estimate]

Repair:
[Start Repair]

Parts:
[Add Part]

[Waiting for Parts]

[Mark Completed]
```

Only show actions valid for the current state.

---

# 30. ADMIN REQUEST DETAIL

Admin should eventually see the complete operational picture:

```text
Customer
Appliance
Problem
Request Status
Technician
Availability
Appointment
Diagnosis
Estimate
Parts
Invoice
Payment
Feedback
Timeline
```

Admin coordinates the process but does not perform technician work.

---

# 31. NOTIFICATION SYSTEM

Keep the existing notification system.

Extend it gradually.

Potential notification types:

```text
NEW_SERVICE_REQUEST
TECHNICIAN_ASSIGNED
JOB_CONFIRMED
TECHNICIAN_ON_WAY
DIAGNOSIS_ADDED
ESTIMATE_CREATED
ESTIMATE_APPROVED
ESTIMATE_REJECTED
WAITING_FOR_PARTS
PARTS_AVAILABLE
SERVICE_COMPLETED
INVOICE_CREATED
PAYMENT_RECEIVED
SERVICE_CLOSED
WARRANTY_UPDATE
NEW_FEEDBACK
```

Only implement each event when its underlying workflow exists.

---

# 32. ROLE SECURITY

Backend must enforce authorization.

## Customer

Can modify only their own:

- profile
- appliances
- service requests
- estimate decisions
- invoices/payment actions
- feedback

Cannot:

- assign technicians
- modify another customer's request
- arbitrarily change service status
- manage parts

## Administrator

Can:

- manage operational requests
- assign technicians
- manage appointments
- manage technicians/customers
- manage parts
- manage invoices/payments according to defined permissions
- manage warranty
- generate reports

## Technician

Can:

- access assigned jobs
- accept assigned jobs
- update assigned job status
- diagnose assigned appliances
- create estimates where allowed
- record repair work
- record parts
- complete assigned services

Cannot:

- modify unrelated requests
- assign arbitrary technicians
- manage platform users

---

# 33. CURRENT BOOKING LOGIC SHOULD BE REUSED

The current application already has:

- schedules
- slots
- availability
- conflict detection
- notifications

Do not waste this work.

Evolve the existing scheduling logic into an Appointment/assignment system.

For example:

```text
Existing slot/conflict logic
        ↓
Appointment scheduling
        ↓
Technician assignment
```

---

# 34. PROVIDER → TECHNICIAN MIGRATION

The current application calls the service worker a:

> Provider

The target product should generally call them:

> Technician

However, do not destructively rename database models simply for terminology.

It may be safer to keep internal names such as:

```text
ProviderProfile
ProviderService
```

temporarily while changing the visible product language to:

```text
Technician
```

Then refactor internal names later if necessary.

---

# 35. PAYMENT ARCHITECTURE

The current payment page is a demo.

The target architecture should be:

```text
Invoice
   ↓
Payment
   ↓
Payment Gateway
   ↓
Payment Result
```

Later the real gateway can be connected.

The demo must remain clearly distinguishable from production payment processing.

---

# 36. MOCK FALLBACK

The existing project has in-memory mock fallback behavior for development/demo use.

Do not remove it without a reason.

If new models require mock support, add only the minimum necessary mock behavior.

The application should remain demonstrable during development.

---

# 37. NEPAL LOCALIZATION MUST NOT REGRESS

Keep:

```text
Rs.
Kathmandu
Bagmati Province
Nepal
Citizenship Number
Postal Code
Province
eSewa
Khalti
IME Pay
Fonepay
Nabil Bank
Rastriya Banijya Bank
Global IME
NIC Asia
Kumari Bank
Everest Bank
```

where applicable.

Do not reintroduce old localization such as:

```text
₹
INR
Aadhaar
UPI
Delhi
Sonipat
Haryana
```

unless an internal legacy database field requires it for compatibility.

---

# 38. FRONTEND MIGRATION ORDER

Do not redesign every screen at once.

Use this sequence:

```text
Phase 1 — Understand current repository
Phase 2 — Design/evolve database
Phase 3 — Appliance management
Phase 4 — Service Request creation
Phase 5 — Admin assignment
Phase 6 — Technician workflow
Phase 7 — Diagnosis
Phase 8 — Estimate + approval
Phase 9 — Spare parts
Phase 10 — Completion
Phase 11 — Invoice
Phase 12 — Payment
Phase 13 — Feedback
Phase 14 — Warranty/history
Phase 15 — Notifications
Phase 16 — Dashboards
Phase 17 — Reports
Phase 18 — Final testing
```

---

# 39. PHASE 1 — INSPECT FIRST

Before coding, inspect:

```text
frontend/src/app
frontend/src/components
backend/controllers
backend/routes
backend/middlewares
backend/utils
backend/prisma/schema.prisma
backend/prisma/seed.js
package.json
```

Then produce:

```text
Current architecture
Current data model
Current booking flow
Reusable components
Required new entities
Required changed entities
Files likely to change
Compatibility risks
```

Do not modify code before understanding it.

---

# 40. PHASE 2 — DATA MODEL

Design the target domain around:

```text
Customer
Appliance
ServiceRequest
Appointment
Technician
Diagnosis
Estimate
EstimateItem
SparePart
PartUsage
Invoice
InvoiceItem
Payment
Warranty
Feedback
StatusHistory
Notification
```

But only create entities that are actually needed.

Validate Prisma after every schema change.

---

# 41. PHASE 3 — CUSTOMER APPLIANCE FLOW

Build:

```text
Customer
 ↓
My Appliances
 ↓
Add Appliance
 ↓
View Appliance
 ↓
Service History
```

Then:

```text
Select Appliance
 ↓
Request Service
 ↓
Describe Problem
 ↓
Submit
```

Request starts as:

```text
REQUESTED
```

---

# 42. PHASE 4 — ADMIN ASSIGNMENT

Build:

```text
Admin
 ↓
Service Requests
 ↓
Open Request
 ↓
Check Availability
 ↓
Assign Technician
```

Then:

```text
REQUESTED
→ ASSIGNED
```

Notify technician.

---

# 43. PHASE 5 — TECHNICIAN WORKFLOW

Build:

```text
Assigned
 ↓
Accept
 ↓
Confirmed
 ↓
On Way
 ↓
Diagnosing
 ↓
Diagnosis
 ↓
Estimate if needed
 ↓
Repair
```

Enforce status transitions in the backend.

---

# 44. PHASE 6 — ESTIMATE

Build:

```text
Technician
 ↓
Create Estimate
 ↓
Customer Notification
 ↓
Customer Reviews
 ↓
Approve / Reject
```

Do not proceed through an approval-required repair without approval.

---

# 45. PHASE 7 — PARTS

Build:

```text
In Progress
 ↓
Parts Required
 ↓
Waiting for Parts
 ↓
Parts Available
 ↓
In Progress
```

Keep the data model extensible for inventory later.

---

# 46. PHASE 8 — COMPLETION + FINANCIAL FLOW

Build:

```text
Completed
 ↓
Invoice
 ↓
Payment
 ↓
Paid
 ↓
Closed
```

Then feedback/history.

---

# 47. API DIRECTION

The existing REST conventions should be reused.

Possible domain endpoints:

```text
GET    /api/appliances
POST   /api/appliances
GET    /api/appliances/:id
PUT    /api/appliances/:id
DELETE /api/appliances/:id
```

```text
GET    /api/service-requests
POST   /api/service-requests
GET    /api/service-requests/:id
PATCH  /api/service-requests/:id/status
POST   /api/service-requests/:id/assign
```

```text
POST   /api/service-requests/:id/diagnosis
GET    /api/service-requests/:id/diagnosis
```

```text
POST   /api/service-requests/:id/estimate
GET    /api/service-requests/:id/estimate
PATCH  /api/estimates/:id/approve
PATCH  /api/estimates/:id/reject
```

```text
POST   /api/service-requests/:id/parts
```

```text
POST   /api/service-requests/:id/complete
```

```text
GET    /api/invoices/:id
POST   /api/payments
```

These are architectural examples. Follow the repository's existing naming and controller conventions rather than blindly copying them.

---

# 48. VALIDATION RULE

Backend is the source of truth.

For every important operation check:

```text
Authenticated?
Role allowed?
Owns/has access to resource?
Current status allows operation?
Required data exists?
```

Never rely only on disabled buttons in React.

---

# 49. DESIGN PRINCIPLE

The diagrams are **business/architecture references**, not literal UI designs.

Do not turn the website into a UML diagram.

The actual product should feel professional and practical.

Use:

- clear cards
- timelines
- status badges
- operational tables
- forms
- confirmations
- notifications
- responsive layouts
- existing Sudhar Lab visual identity

The UI should communicate:

> **"Your repair is being managed."**

rather than only:

> **"You booked a technician."**

---

# 50. WHAT NOT TO INVENT

If the teacher's material does not define a business rule, do not silently invent one.

Examples:

- Tax percentage
- Warranty duration
- Cancellation fees
- Refund policy
- Technician salary
- Commission percentage
- Exact spare-part procurement rules
- Exact consequences of estimate rejection
- Exact payment gateway API
- Exact invoice numbering rules

When a decision becomes necessary:

1. Identify the missing rule.
2. Keep the architecture flexible.
3. Use a temporary assumption only when necessary.
4. Clearly label it as a temporary assumption.

---

# 51. TESTING

After each phase, test the real workflow.

## Customer

```text
Login
→ Add appliance
→ Create service request
→ Verify REQUESTED
```

## Admin

```text
Login
→ See request
→ Check availability
→ Assign technician
→ Verify ASSIGNED
```

## Technician

```text
Login
→ See assigned request
→ Accept
→ Confirmed
→ On Way
→ Diagnosing
```

## Diagnosis

```text
Add diagnosis
→ Save
```

## Estimate

```text
Create estimate
→ Customer notified
→ Customer approves
```

## Parts

```text
In Progress
→ Waiting for Parts
→ Parts Available
→ In Progress
```

## Completion

```text
Completed
→ Invoiced
```

## Payment

```text
Invoice
→ Demo/real payment layer
→ Paid
```

## Closure

```text
Paid
→ Feedback
→ Closed
```

---

# 52. BUILD SAFETY

After changes:

```text
npm run build
```

must remain successful.

Also test the frontend and backend development servers.

Fix:

- compile errors
- Prisma errors
- API errors
- React errors
- hydration issues
- broken imports
- broken routes
- authorization bugs
- invalid status transitions

before moving on.

---

# 53. DO NOT IMPLEMENT EVERYTHING IN ONE SHOT

For every phase:

1. Explain the intended change.
2. Inspect relevant files.
3. Modify the smallest coherent set of files.
4. Validate.
5. Test.
6. Fix errors.
7. Report what changed.
8. Move to the next phase.

Do not make hundreds of unrelated changes at once.

---

# 54. FINAL TARGET ARCHITECTURE

```text
                         SUDHAR LAB
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
      CUSTOMER             ADMIN              TECHNICIAN
          │                   │                   │
      Appliances         Operations          Assigned Jobs
          │              Management                │
          │                   │                   │
          └────────── Service Request ────────────┘
                              │
                         Appointment
                              │
                         Diagnosis
                              │
                           Estimate
                              │
                     Customer Approval
                              │
                         Repair Work
                              │
                       Spare Parts
                              │
                       Service Complete
                              │
                           Invoice
                              │
                           Payment
                              │
                          Feedback
                              │
                           Warranty
                              │
                            Closed
```

---

# 55. SUCCESS CRITERIA

The migration is successful when this complete demo works:

```text
Customer logs in
      ↓
Registers appliance
      ↓
Creates service request
      ↓
Request becomes REQUESTED
      ↓
Admin receives request
      ↓
Admin checks availability
      ↓
Admin assigns technician
      ↓
Request becomes ASSIGNED
      ↓
Technician receives job
      ↓
Technician accepts
      ↓
CONFIRMED
      ↓
TECHNICIAN_ON_WAY
      ↓
DIAGNOSING
      ↓
Diagnosis recorded
      ↓
Estimate created if needed
      ↓
Customer approves
      ↓
IN_PROGRESS
      ↓
WAITING_FOR_PARTS if needed
      ↓
IN_PROGRESS
      ↓
COMPLETED
      ↓
INVOICED
      ↓
PAID
      ↓
Feedback
      ↓
CLOSED
```

The appliance retains the entire service history.

---

# 56. MASTER COMMAND TO THE CODING AI

You are working on an **existing** codebase called **LocalHelp / Sudhar Lab**.

Do not treat this as a request to create a brand-new application.

First understand the current implementation.

Then evolve it toward a complete appliance-service lifecycle management platform.

The teacher's intended operational flow is:

```text
Customer creates Service Request
→ Administrator reviews
→ Administrator checks technician availability
→ Administrator assigns/reschedules
→ Technician accepts
→ Technician visits
→ Technician diagnoses
→ Estimate if required
→ Customer approves
→ Technician repairs
→ Parts workflow if required
→ Service completed
→ Invoice
→ Payment
→ Feedback
→ Closed
```

The teacher's intended lifecycle is:

```text
Requested
→ Assigned
→ Confirmed
→ Technician On Way
→ Diagnosing
→ In Progress
→ Waiting for Parts
→ In Progress
→ Completed
→ Invoiced
→ Paid
→ Closed
```

with:

```text
Requested → Cancelled
```

for customer withdrawal.

**Preserve useful existing work.**

**Do not rewrite the project blindly.**

**Do not invent unsupported business rules.**

**Do not implement everything at once.**

**Inspect first.**

**Plan second.**

**Implement incrementally.**

**Validate continuously.**

**Keep the build working.**

The final product should model the **real repair-service lifecycle**, not merely a booking form.
