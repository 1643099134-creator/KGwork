CREATE TABLE `assistant_events` (
	`id` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`owner` text NOT NULL,
	`kind` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL,
	`claim` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assistant_health` (
	`id` text PRIMARY KEY NOT NULL,
	`last_run` integer NOT NULL,
	`summary` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `assistant_settings` (
	`team` text PRIMARY KEY NOT NULL,
	`enabled` integer DEFAULT 1 NOT NULL,
	`digest` integer DEFAULT 1 NOT NULL,
	`digest_time` text DEFAULT '18:00' NOT NULL,
	`work_start` text DEFAULT '09:00' NOT NULL,
	`work_end` text DEFAULT '19:00' NOT NULL,
	`updated` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `task_plans` (
	`note` text PRIMARY KEY NOT NULL,
	`team` text NOT NULL,
	`time` text DEFAULT '17:00' NOT NULL,
	`reminders` text DEFAULT '[]' NOT NULL,
	`review_required` integer DEFAULT 1 NOT NULL,
	`blocked` text DEFAULT '' NOT NULL,
	`snooze` integer DEFAULT 0 NOT NULL,
	`ack` integer DEFAULT 0 NOT NULL,
	`updated` integer NOT NULL
);
