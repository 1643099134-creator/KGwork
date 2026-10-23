
CREATE TABLE `project_file_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`item` text NOT NULL,
	`source` text NOT NULL,
	`action` text NOT NULL,
	`actor` text NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_file_annotations` (
	`id` text PRIMARY KEY NOT NULL,
	`project` text NOT NULL,
	`item` text NOT NULL,
	`source` text NOT NULL,
	`page` integer DEFAULT 1 NOT NULL,
	`x` integer,
	`y` integer,
	`quote` text DEFAULT '' NOT NULL,
	`body` text NOT NULL,
	`author` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `project_file_meta` (
	`project` text NOT NULL,
	`item` text NOT NULL,
	`source` text NOT NULL,
	`category` text DEFAULT '项目资料' NOT NULL,
	`series` text DEFAULT '' NOT NULL,
	`revision` integer DEFAULT 0 NOT NULL,
	`claim` text DEFAULT '' NOT NULL,
	`purpose` text DEFAULT 'material' NOT NULL,
	`status` text DEFAULT 'material' NOT NULL,
	`submitter` text DEFAULT '' NOT NULL,
	`reviewer` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`feedback` text DEFAULT '' NOT NULL,
	`submitted` integer DEFAULT 0 NOT NULL,
	`reviewed` integer DEFAULT 0 NOT NULL,
	`reviewed_by` text DEFAULT '' NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated` integer NOT NULL,
	PRIMARY KEY(`project`, `item`, `source`)
);
