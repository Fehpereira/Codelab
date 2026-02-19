/*
  Warnings:

  - Added the required column `discountPrice` to the `courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "discountPrice" DOUBLE PRECISION NOT NULL;
