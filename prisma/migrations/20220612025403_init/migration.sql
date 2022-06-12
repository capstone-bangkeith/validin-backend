/*
  Warnings:

  - A unique constraint covering the columns `[uid]` on the table `ktp` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ttl` to the `ktp` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uid` to the `ktp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ktp" ADD COLUMN     "ttl" VARCHAR(50) NOT NULL,
ADD COLUMN     "uid" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ktp_uid_key" ON "ktp"("uid");
