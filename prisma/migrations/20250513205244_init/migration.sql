-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `birthDate` VARCHAR(191) NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `role` ENUM('CLIENT', 'BARBER', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `isBlackListed` BOOLEAN NOT NULL DEFAULT false,
    `pushToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `studentPrice` DOUBLE NOT NULL,
    `duration` INTEGER NOT NULL,
    `show` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Salon` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(191) NOT NULL,
    `isOpenMonday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenTuesday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenWednesday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenThursday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenFriday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenSaturday` BOOLEAN NOT NULL DEFAULT false,
    `isOpenSunday` BOOLEAN NOT NULL DEFAULT false,
    `mondayOpeningTime` VARCHAR(191) NOT NULL,
    `mondayClosingTime` VARCHAR(191) NOT NULL,
    `tuesdayOpeningTime` VARCHAR(191) NOT NULL,
    `tuesdayClosingTime` VARCHAR(191) NOT NULL,
    `wednesdayOpeningTime` VARCHAR(191) NOT NULL,
    `wednesdayClosingTime` VARCHAR(191) NOT NULL,
    `thursdayOpeningTime` VARCHAR(191) NOT NULL,
    `thursdayClosingTime` VARCHAR(191) NOT NULL,
    `fridayOpeningTime` VARCHAR(191) NOT NULL,
    `fridayClosingTime` VARCHAR(191) NOT NULL,
    `saturdayOpeningTime` VARCHAR(191) NOT NULL,
    `saturdayClosingTime` VARCHAR(191) NOT NULL,
    `sundayOpeningTime` VARCHAR(191) NOT NULL,
    `sundayClosingTime` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Salon_name_key`(`name`),
    UNIQUE INDEX `Salon_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalonClosures` (
    `id` VARCHAR(191) NOT NULL,
    `salonId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SalonBreaks` (
    `id` VARCHAR(191) NOT NULL,
    `salonId` VARCHAR(191) NOT NULL,
    `breakDate` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Guest` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `guestId` VARCHAR(191) NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `serviceId` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Appointment_barberId_date_startTime_key`(`barberId`, `date`, `startTime`),
    UNIQUE INDEX `Appointment_barberId_date_endTime_key`(`barberId`, `date`, `endTime`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barber` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `salonId` VARCHAR(191) NOT NULL,
    `imgUrl` VARCHAR(191) NOT NULL,
    `pseudo` VARCHAR(191) NOT NULL,
    `instagram` VARCHAR(191) NOT NULL,
    `snapchat` VARCHAR(191) NOT NULL,
    `isWorkingMonday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingTuesday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingWednesday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingThursday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingFriday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingSaturday` BOOLEAN NOT NULL DEFAULT true,
    `isWorkingSunday` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Barber_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BarberBreaks` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `breakDate` DATETIME(3) NOT NULL,
    `startTime` VARCHAR(191) NOT NULL,
    `endTime` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BarberAbsences` (
    `id` VARCHAR(191) NOT NULL,
    `barberId` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SalonClosures` ADD CONSTRAINT `SalonClosures_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SalonBreaks` ADD CONSTRAINT `SalonBreaks_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_guestId_fkey` FOREIGN KEY (`guestId`) REFERENCES `Guest`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `Barber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barber` ADD CONSTRAINT `Barber_salonId_fkey` FOREIGN KEY (`salonId`) REFERENCES `Salon`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barber` ADD CONSTRAINT `Barber_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BarberBreaks` ADD CONSTRAINT `BarberBreaks_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `Barber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BarberAbsences` ADD CONSTRAINT `BarberAbsences_barberId_fkey` FOREIGN KEY (`barberId`) REFERENCES `Barber`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
