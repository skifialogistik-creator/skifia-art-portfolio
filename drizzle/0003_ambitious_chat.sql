CREATE TABLE `siteInquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`publicId` varchar(32) NOT NULL,
	`status` enum('received','reviewed','archived') NOT NULL DEFAULT 'received',
	`siteNumber` varchar(4) NOT NULL,
	`siteName` varchar(120) NOT NULL,
	`price` varchar(80) NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`contact` varchar(320) NOT NULL,
	`comment` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `siteInquiries_id` PRIMARY KEY(`id`),
	CONSTRAINT `siteInquiries_publicId_unique` UNIQUE(`publicId`)
);
