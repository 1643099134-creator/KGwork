CREATE TABLE `library_trash` (
	`team` text NOT NULL,
	`item` text NOT NULL,
	`source` text NOT NULL,
	`actor` text NOT NULL,
	`deleted` integer NOT NULL,
	PRIMARY KEY(`team`, `item`, `source`)
);
