CREATE TABLE `local_sessions` (
	`token` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `local_users` (
	`email` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`must_change` integer DEFAULT 1 NOT NULL,
	`created` integer NOT NULL
);
