CREATE TABLE `chat_mutes` (
	`team` text NOT NULL,
	`user` text NOT NULL,
	`muted` integer DEFAULT 1 NOT NULL,
	PRIMARY KEY(`team`, `user`)
);
--> statement-breakpoint
CREATE TABLE `library_group_members` (
	`team` text NOT NULL,
	`group_id` text NOT NULL,
	`user` text NOT NULL,
	PRIMARY KEY(`team`, `group_id`, `user`)
);
--> statement-breakpoint
CREATE TABLE `library_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`name` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `library_items` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`owner` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`mime` text DEFAULT '' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`allowed` text DEFAULT '[]' NOT NULL,
	`groups` text DEFAULT '[]' NOT NULL,
	`denied` text DEFAULT '[]' NOT NULL,
	`source` text DEFAULT '直接上传' NOT NULL,
	`created` integer NOT NULL,
	`updated` integer NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
ALTER TABLE `chat_messages` ADD `held` integer DEFAULT 0 NOT NULL;