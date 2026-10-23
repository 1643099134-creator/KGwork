ALTER TABLE `project_file_meta` ADD `opened` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `project_file_meta` ADD `opened_by` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `project_file_meta` ADD `review_due` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `project_file_meta` ADD `snooze` integer DEFAULT 0 NOT NULL;