CREATE TABLE `chat_messages` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team` text NOT NULL,
	`room` text NOT NULL,
	`sender` text NOT NULL,
	`recipient` text DEFAULT '' NOT NULL,
	`author` text NOT NULL,
	`body` text NOT NULL,
	`created` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_reads` (
	`team` text NOT NULL,
	`user` text NOT NULL,
	`room` text NOT NULL,
	`lastseq` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`team`, `user`, `room`)
);
