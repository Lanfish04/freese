/*
  Warnings:

  - The primary key for the `buyers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `buyerId` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `buyers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `buyers` table. All the data in the column will be lost.
  - The primary key for the `farmers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `email` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `farmerId` on the `farmers` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `farmers` table. All the data in the column will be lost.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `price` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `products` table. All the data in the column will be lost.
  - You are about to drop the `history` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `address` to the `Buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessName` to the `Buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessType` to the `Buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Buyers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmName` to the `Farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productsType` to the `Farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Farmers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `farmerId` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image_products` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_products` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_products` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `history` DROP FOREIGN KEY `History_buyerId_fkey`;

-- DropForeignKey
ALTER TABLE `history` DROP FOREIGN KEY `History_farmerId_fkey`;

-- DropForeignKey
ALTER TABLE `history` DROP FOREIGN KEY `History_productId_fkey`;

-- DropIndex
DROP INDEX `Buyers_email_key` ON `buyers`;

-- DropIndex
DROP INDEX `Farmers_email_key` ON `farmers`;

-- AlterTable
ALTER TABLE `buyers` DROP PRIMARY KEY,
    DROP COLUMN `buyerId`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `businessName` VARCHAR(191) NOT NULL,
    ADD COLUMN `businessType` VARCHAR(191) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `farmers` DROP PRIMARY KEY,
    DROP COLUMN `email`,
    DROP COLUMN `farmerId`,
    DROP COLUMN `name`,
    ADD COLUMN `address` VARCHAR(191) NOT NULL,
    ADD COLUMN `farmName` VARCHAR(191) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `productsType` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    DROP COLUMN `price`,
    DROP COLUMN `productId`,
    DROP COLUMN `quantity`,
    ADD COLUMN `farmerId` INTEGER NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `image_products` VARCHAR(191) NOT NULL,
    ADD COLUMN `price_products` DOUBLE NOT NULL,
    ADD COLUMN `stock_products` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `history`;

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `role` ENUM('FARMER', 'BUYER', 'BOTH') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Buyers` ADD CONSTRAINT `Buyers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Farmers` ADD CONSTRAINT `Farmers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Products` ADD CONSTRAINT `Products_farmerId_fkey` FOREIGN KEY (`farmerId`) REFERENCES `Farmers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
