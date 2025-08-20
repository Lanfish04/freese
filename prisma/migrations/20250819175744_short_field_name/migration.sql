/*
  Warnings:

  - You are about to drop the column `image_products` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `name_products` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `price_products` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `stock_products` on the `products` table. All the data in the column will be lost.
  - Added the required column `image` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock` to the `Products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `products` DROP COLUMN `image_products`,
    DROP COLUMN `name_products`,
    DROP COLUMN `price_products`,
    DROP COLUMN `stock_products`,
    ADD COLUMN `description` VARCHAR(191) NULL,
    ADD COLUMN `image` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `price` DOUBLE NOT NULL,
    ADD COLUMN `stock` INTEGER NOT NULL;
