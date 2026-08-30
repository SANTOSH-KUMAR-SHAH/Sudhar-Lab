-- Sudhar Lab service lifecycle foundation
CREATE TYPE "ServiceRequestStatus" AS ENUM ('REQUESTED','ASSIGNED','CONFIRMED','TECHNICIAN_ON_WAY','DIAGNOSING','IN_PROGRESS','WAITING_FOR_PARTS','COMPLETED','INVOICED','PAID','CLOSED','CANCELLED');
CREATE TYPE "EstimateStatus" AS ENUM ('PENDING','APPROVED','REJECTED');
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED','RESCHEDULED','CANCELLED','COMPLETED');
CREATE TYPE "InvoiceStatus" AS ENUM ('ISSUED','PAID');
CREATE TYPE "PaymentMethod" AS ENUM ('DEMO','ESEWA','KHALTI','FONEPAY','IMEPAY');
CREATE TYPE "PaymentStatus" AS ENUM ('SIMULATED','SUCCESS','FAILED');

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'NEW_SERVICE_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TECHNICIAN_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'JOB_CONFIRMED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'TECHNICIAN_ON_WAY';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'DIAGNOSIS_ADDED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESTIMATE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESTIMATE_APPROVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'ESTIMATE_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WAITING_FOR_PARTS';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PARTS_AVAILABLE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SERVICE_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'INVOICE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'PAYMENT_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'SERVICE_CLOSED';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'WARRANTY_UPDATE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'NEW_FEEDBACK';

CREATE TABLE "Appliance" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "type" TEXT NOT NULL, "brand" TEXT NOT NULL,
  "model" TEXT, "serialNumber" TEXT, "purchaseDate" TIMESTAMP(3), "warrantyInfo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Appliance_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ServiceRequest" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "applianceId" TEXT NOT NULL, "technicianId" TEXT,
  "categoryId" TEXT, "subcategoryId" TEXT, "problem" TEXT NOT NULL, "address" TEXT,
  "status" "ServiceRequestStatus" NOT NULL DEFAULT 'REQUESTED', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL, "workPerformed" TEXT, "completedAt" TIMESTAMP(3),
  CONSTRAINT "ServiceRequest_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ServiceRequestStatusHistory" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "fromStatus" "ServiceRequestStatus", "toStatus" "ServiceRequestStatus" NOT NULL,
  "changedById" TEXT NOT NULL, "note" TEXT, "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ServiceRequestStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Diagnosis" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "technicianId" TEXT NOT NULL, "findings" TEXT NOT NULL,
  "recommendedWork" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Diagnosis_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Estimate" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "status" "EstimateStatus" NOT NULL DEFAULT 'PENDING', "customerNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Estimate_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "EstimateItem" (
  "id" TEXT NOT NULL, "estimateId" TEXT NOT NULL, "description" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "EstimateItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SparePart" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "description" TEXT, "unitPrice" DOUBLE PRECISION, "available" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SparePart_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PartUsage" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "partId" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION, "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "PartUsage_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Appointment" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "scheduledAt" TIMESTAMP(3) NOT NULL, "endsAt" TIMESTAMP(3), "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED', "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Invoice" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "status" "InvoiceStatus" NOT NULL DEFAULT 'ISSUED', "subtotal" DOUBLE PRECISION NOT NULL, "total" DOUBLE PRECISION NOT NULL, "currency" TEXT NOT NULL DEFAULT 'NPR', "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "paidAt" TIMESTAMP(3), CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "InvoiceItem" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "description" TEXT NOT NULL, "quantity" INTEGER NOT NULL DEFAULT 1, "unitPrice" DOUBLE PRECISION NOT NULL, CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Payment" (
  "id" TEXT NOT NULL, "invoiceId" TEXT NOT NULL, "amount" DOUBLE PRECISION NOT NULL, "method" "PaymentMethod" NOT NULL, "status" "PaymentStatus" NOT NULL DEFAULT 'SIMULATED', "reference" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Warranty" (
  "id" TEXT NOT NULL, "requestId" TEXT NOT NULL, "coverage" TEXT NOT NULL, "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMP(3), "terms" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "Warranty_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Diagnosis_requestId_key" ON "Diagnosis"("requestId");
CREATE UNIQUE INDEX "Estimate_requestId_key" ON "Estimate"("requestId");
CREATE UNIQUE INDEX "Appointment_requestId_key" ON "Appointment"("requestId");
CREATE UNIQUE INDEX "Invoice_requestId_key" ON "Invoice"("requestId");
CREATE UNIQUE INDEX "Warranty_requestId_key" ON "Warranty"("requestId");
CREATE INDEX "Appliance_customerId_idx" ON "Appliance"("customerId");
CREATE INDEX "ServiceRequest_customerId_status_idx" ON "ServiceRequest"("customerId", "status");
CREATE INDEX "ServiceRequest_technicianId_status_idx" ON "ServiceRequest"("technicianId", "status");
CREATE INDEX "ServiceRequestStatusHistory_requestId_changedAt_idx" ON "ServiceRequestStatusHistory"("requestId", "changedAt");
CREATE INDEX "EstimateItem_estimateId_idx" ON "EstimateItem"("estimateId");
CREATE INDEX "PartUsage_requestId_idx" ON "PartUsage"("requestId");
CREATE INDEX "Appointment_scheduledAt_status_idx" ON "Appointment"("scheduledAt", "status");

ALTER TABLE "Appliance" ADD CONSTRAINT "Appliance_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceRequest" ADD CONSTRAINT "ServiceRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON UPDATE CASCADE, ADD CONSTRAINT "ServiceRequest_applianceId_fkey" FOREIGN KEY ("applianceId") REFERENCES "Appliance"("id") ON UPDATE CASCADE, ADD CONSTRAINT "ServiceRequest_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON UPDATE CASCADE, ADD CONSTRAINT "ServiceRequest_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ServiceCategory"("id") ON UPDATE CASCADE, ADD CONSTRAINT "ServiceRequest_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "ServiceSubCategory"("id") ON UPDATE CASCADE;
ALTER TABLE "ServiceRequestStatusHistory" ADD CONSTRAINT "ServiceRequestStatusHistory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT "ServiceRequestStatusHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT "Diagnosis_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User"("id") ON UPDATE CASCADE;
ALTER TABLE "Estimate" ADD CONSTRAINT "Estimate_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EstimateItem" ADD CONSTRAINT "EstimateItem_estimateId_fkey" FOREIGN KEY ("estimateId") REFERENCES "Estimate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SparePart" ADD CONSTRAINT "SparePart_id_check" CHECK (length("id") > 0);
ALTER TABLE "PartUsage" ADD CONSTRAINT "PartUsage_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE, ADD CONSTRAINT "PartUsage_partId_fkey" FOREIGN KEY ("partId") REFERENCES "SparePart"("id") ON UPDATE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON UPDATE CASCADE;
ALTER TABLE "Warranty" ADD CONSTRAINT "Warranty_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ServiceRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
