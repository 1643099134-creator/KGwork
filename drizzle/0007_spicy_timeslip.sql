CREATE TABLE `calendar_events` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`owner` text NOT NULL,
	`title` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`start` text DEFAULT '' NOT NULL,
	`end` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` integer NOT NULL,
	`deleted` integer DEFAULT 0 NOT NULL
);
