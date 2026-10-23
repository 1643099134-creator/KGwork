CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`user` text NOT NULL,
	`note` text NOT NULL,
	`title` text NOT NULL,
	`created` integer NOT NULL,
	`read` integer DEFAULT 0 NOT NULL,
	`mailstate` text DEFAULT 'pending' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`mailupdated` integer DEFAULT 0 NOT NULL,
	`claim` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_shares` (
	`id` text PRIMARY KEY NOT NULL,
	`hash` text NOT NULL,
	`team` text NOT NULL,
	`owner` text NOT NULL,
	`target` text NOT NULL,
	`taskids` text NOT NULL,
	`title` text NOT NULL,
	`created` integer NOT NULL,
	`expires` integer NOT NULL,
	`revoked` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `task_shares_hash_unique` ON `task_shares` (`hash`);--> statement-breakpoint
ALTER TABLE `notes` ADD `priority` text DEFAULT 'normal' NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `progress` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `notes` ADD `creator` text DEFAULT '' NOT NULL;