CREATE TABLE `list_permissions` (
	`team` text NOT NULL,
	`owner` text NOT NULL,
	`viewer` text NOT NULL,
	PRIMARY KEY(`team`, `owner`, `viewer`)
);
