CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`note` text NOT NULL,
	`body` text NOT NULL,
	`author` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invites` (
	`hash` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`role` text NOT NULL,
	`expires` integer NOT NULL,
	`used` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `members` (
	`team` text NOT NULL,
	`user` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`team`, `user`)
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`book` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`color` text NOT NULL,
	`kind` text NOT NULL,
	`status` text NOT NULL,
	`assignee` text NOT NULL,
	`due` text NOT NULL,
	`pinned` integer NOT NULL,
	`archived` integer NOT NULL,
	`version` integer NOT NULL,
	`updated` integer NOT NULL,
	`editor` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `revisions` (
	`id` text PRIMARY KEY NOT NULL,
	`note` text NOT NULL,
	`version` integer NOT NULL,
	`snapshot` text NOT NULL,
	`editor` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created` integer NOT NULL
);
