CREATE TABLE client_portals (id TEXT PRIMARY KEY NOT NULL, team TEXT NOT NULL, owner TEXT NOT NULL, token TEXT NOT NULL UNIQUE, draft TEXT NOT NULL, published TEXT NOT NULL DEFAULT '', code_hash TEXT NOT NULL DEFAULT '', expires INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, published_at INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, updated INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX client_portals_team_updated ON client_portals(team,updated);
--> statement-breakpoint
CREATE TABLE portal_attempts (key TEXT PRIMARY KEY NOT NULL, count INTEGER NOT NULL DEFAULT 0, expires INTEGER NOT NULL);
--> statement-breakpoint
CREATE INDEX portal_attempts_expiry ON portal_attempts(expires);
