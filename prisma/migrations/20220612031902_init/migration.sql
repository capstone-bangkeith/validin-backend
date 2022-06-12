/*
  Warnings:

  - Added the required column `jenis_kelamin` to the `ktp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ktp" ADD COLUMN     "jenis_kelamin" VARCHAR(20) NOT NULL;
