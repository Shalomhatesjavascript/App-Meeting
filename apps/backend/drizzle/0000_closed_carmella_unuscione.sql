CREATE TABLE `adminLogs` (
	`action` text(255) NOT NULL,
	`adminId` text NOT NULL,
	`createdAt` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`targetUserId` text,
	FOREIGN KEY (`adminId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`targetUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `targetUserIdIdx` ON `adminLogs` (`targetUserId`);--> statement-breakpoint
CREATE TABLE `interests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interests_name_unique` ON `interests` (`name`);--> statement-breakpoint
CREATE TABLE `likes` (
	`createdAt` integer NOT NULL,
	`fromUserId` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isLike` integer NOT NULL,
	`toUserId` text NOT NULL,
	FOREIGN KEY (`fromUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`toUserId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "fromUserIdNotEqualWithToUserId" CHECK(not "likes"."fromUserId" = "likes"."toUserId")
);
--> statement-breakpoint
CREATE INDEX `fromUserIdIdx` ON `likes` (`fromUserId`);--> statement-breakpoint
CREATE INDEX `toUserIdx` ON `likes` (`toUserId`);--> statement-breakpoint
CREATE TABLE `matches` (
	`createdAt` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1Id` text NOT NULL,
	`user2Id` text NOT NULL,
	FOREIGN KEY (`user1Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user2Id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `user1IdIdx` ON `matches` (`user1Id`);--> statement-breakpoint
CREATE INDEX `user2IdIdx` ON `matches` (`user2Id`);--> statement-breakpoint
CREATE TABLE `messages` (
	`content` text NOT NULL,
	`createdAt` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`isRead` integer DEFAULT false NOT NULL,
	`matchId` integer NOT NULL,
	`senderId` text NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `matchIdIdx` ON `messages` (`matchId`);--> statement-breakpoint
CREATE INDEX `senderId` ON `messages` (`senderId`);--> statement-breakpoint
CREATE TABLE `profiles` (
	`avatarSeed` text(100) DEFAULT 'default' NOT NULL,
	`avatarStyle` text(50) DEFAULT 'notionists' NOT NULL,
	`alias` text(50) NOT NULL,
	`bio` text,
	`department` text(100) NOT NULL,
	`fullName` text(100) NOT NULL,
	`gender` text NOT NULL,
	`intent` text NOT NULL,
	`isIdVerified` integer DEFAULT false NOT NULL,
	`level` integer NOT NULL,
	`userId` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`expiryDate` integer NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`paymentRef` text NOT NULL,
	`startDate` integer NOT NULL,
	`tier` text NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userInterests` (
	`interestId` integer NOT NULL,
	`userId` text NOT NULL,
	PRIMARY KEY(`userId`, `interestId`),
	FOREIGN KEY (`interestId`) REFERENCES `interests`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `userMeta` (
	`isApproved` integer DEFAULT false NOT NULL,
	`isBanned` integer DEFAULT false NOT NULL,
	`isVerified` integer DEFAULT false NOT NULL,
	`role` text DEFAULT 'Free' NOT NULL,
	`userId` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`accessToken` text,
	`accessTokenExpiresAt` integer,
	`accountId` text NOT NULL,
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`idToken` text,
	`password` text,
	`providerId` text NOT NULL,
	`refreshToken` text,
	`refreshTokenExpiresAt` integer,
	`scope` text,
	`updatedAt` integer NOT NULL,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `accounts_userId_idx` ON `accounts` (`userId`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expiresAt` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`ipAddress` text,
	`token` text NOT NULL,
	`updatedAt` integer NOT NULL,
	`userAgent` text,
	`userId` text NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `sessions_userId_idx` ON `sessions` (`userId`);--> statement-breakpoint
CREATE TABLE `users` (
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`email` text NOT NULL,
	`emailVerified` integer DEFAULT false NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image` text,
	`name` text NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `verifications` (
	`createdAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`expiresAt` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`updatedAt` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);