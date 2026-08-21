CREATE TABLE `telegramNotificationSettings` (
	`id` int NOT NULL,
	`chatId` varchar(32) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `telegramNotificationSettings_id` PRIMARY KEY(`id`)
);
