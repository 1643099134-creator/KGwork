CREATE TABLE reference_cards (id TEXT PRIMARY KEY NOT NULL, team TEXT NOT NULL, owner TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL DEFAULT '待整理', body TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '', fields TEXT NOT NULL DEFAULT '[]', sensitive INTEGER NOT NULL DEFAULT 0, color TEXT NOT NULL DEFAULT 'sage', visibility TEXT NOT NULL DEFAULT 'private', allowed TEXT NOT NULL DEFAULT '[]', denied TEXT NOT NULL DEFAULT '[]', groups TEXT NOT NULL DEFAULT '[]', version INTEGER NOT NULL DEFAULT 1, deleted INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, updated INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX reference_cards_team_owner ON reference_cards(team,owner,deleted);
--> statement-breakpoint
CREATE TABLE reference_usage (card TEXT NOT NULL, user TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, lastused INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(card,user));
