CREATE TABLE `siteContentSettings` (
	`id` int NOT NULL,
	`content` json NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteContentSettings_id` PRIMARY KEY(`id`)
);
