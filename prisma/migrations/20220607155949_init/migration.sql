/*
  Warnings:

  - You are about to alter the column `nik` on the `ktp` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "ktp" ALTER COLUMN "nik" SET DATA TYPE VARCHAR(50);
