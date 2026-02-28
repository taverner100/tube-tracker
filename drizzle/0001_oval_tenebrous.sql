CREATE TABLE `station_visits` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stationId` varchar(32) NOT NULL,
	`photoKey` varchar(512),
	`photoUrl` varchar(1024),
	`photoFilename` varchar(255),
	`visitedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `station_visits_id` PRIMARY KEY(`id`)
);
