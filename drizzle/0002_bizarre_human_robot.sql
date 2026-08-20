CREATE TABLE `siteMediaAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slot` varchar(40) NOT NULL,
	`key` varchar(500) NOT NULL,
	`url` varchar(700) NOT NULL,
	`mimeType` varchar(120) NOT NULL,
	`label` varchar(120) NOT NULL,
	`originalName` varchar(255) NOT NULL,
	`sizeBytes` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteMediaAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteMediaAssets_slot_unique` UNIQUE(`slot`)
);
