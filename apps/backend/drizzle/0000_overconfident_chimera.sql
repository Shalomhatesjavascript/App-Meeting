CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text(255) NOT NULL,
	`password_hash` text NOT NULL,
	`role` text NOT NULL,
	`is_verified` integer DEFAULT 0 NOT NULL,
	`is_banned` integer DEFAULT 0 NOT NULL,
	`is_approved` integer DEFAULT 0 NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `admin_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_id` integer NOT NULL,
	`action` text(255) NOT NULL,
	`target_user_id` integer,
	`timestamp` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`target_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `interests` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text(50) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `interests_name_unique` ON `interests` (`name`);--> statement-breakpoint
CREATE TABLE `likes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` integer NOT NULL,
	`to_user_id` integer NOT NULL,
	`is_like` integer NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user1_id` integer NOT NULL,
	`user2_id` integer NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`user1_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user2_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`match_id` integer NOT NULL,
	`sender_id` integer NOT NULL,
	`content` text NOT NULL,
	`is_read` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP' NOT NULL,
	FOREIGN KEY (`match_id`) REFERENCES `matches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` integer PRIMARY KEY NOT NULL,
	`full_name` text(100) NOT NULL,
	`alias` text(50) NOT NULL,
	`gender` text(20) NOT NULL,
	`department` text(100) NOT NULL,
	`level` integer NOT NULL,
	`bio` text,
	`intent` text NOT NULL,
	`is_id_verified` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`tier` text NOT NULL,
	`start_date` text NOT NULL,
	`expiry_date` text NOT NULL,
	`payment_ref` text(100) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_interests` (
	`user_id` integer NOT NULL,
	`interest_id` integer NOT NULL,
	PRIMARY KEY(`user_id`, `interest_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`interest_id`) REFERENCES `interests`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint