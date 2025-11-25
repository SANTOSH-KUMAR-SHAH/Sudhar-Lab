/*
  Warnings:

  - You are about to drop the column `date` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `bookingEnd` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingStart` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Made the column `duration` on table `ProviderService` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "date",
ADD COLUMN     "bookingEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "bookingStart" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ProviderService" ALTER COLUMN "duration" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Booking_providerId_bookingStart_bookingEnd_idx" ON "Booking"("providerId", "bookingStart", "bookingEnd");
