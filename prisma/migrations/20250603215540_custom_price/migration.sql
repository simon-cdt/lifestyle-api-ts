/*
  Warnings:

  - You are about to drop the column `customPrice` on the `BarberService` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `studentPrice` on the `Service` table. All the data in the column will be lost.
  - Added the required column `price` to the `BarberService` table without a default value. This is not possible if the table is not empty.
  - Added the required column `studentPrice` to the `BarberService` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `BarberService` DROP COLUMN `customPrice`,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `studentPrice` DOUBLE NOT NULL;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `price`,
    DROP COLUMN `studentPrice`;
