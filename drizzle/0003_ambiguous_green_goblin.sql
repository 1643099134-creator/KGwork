CREATE TABLE `task_deliverables` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`note` text NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`url` text DEFAULT '' NOT NULL,
	`object_key` text DEFAULT '' NOT NULL,
	`mime` text DEFAULT '' NOT NULL,
	`size` integer DEFAULT 0 NOT NULL,
	`author` text NOT NULL,
	`created` integer NOT NULL
);
