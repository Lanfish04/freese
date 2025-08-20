/*
  Warnings:

  - You are about to drop the column `userId` on the `history` table. All the data in the column will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `buyerId` to the `History` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmerId` to the `History` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `history` DROP FOREIGN KEY `History_userId_fkey`;

-- DropIndex
DROP INDEX `History_userId_fkey` ON `history`;

-- AlterTable
ALTER TABLE `history` DROP COLUMN `userId`,
    ADD COLUMN `buyerId` INTEGER NOT NULL,
    ADD COLUMN `farmerId` INTEGER NOT NULL;

-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Buyers` (
    `buyerId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Buyers_email_key`(`email`),
    PRIMARY KEY (`buyerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Farmers` (
    `farmerId` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Farmers_email_key`(`email`),
    PRIMARY KEY (`farmerId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `Farmers`(`farmerId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `History` ADD CONSTRAINT `History_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `Buyers`(`buyerId`) ON DELETE RESTRICT ON UPDATE CASCADE;
