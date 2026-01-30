-- AlterTable
ALTER TABLE `messages` ADD COLUMN `status` ENUM('SENT', 'READ') NOT NULL DEFAULT 'SENT';
