-- Custom SQL migration file, put your code below! --
CREATE TABLE project_spaces (id TEXT PRIMARY KEY, team TEXT NOT NULL, name TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT 'sage', owner TEXT NOT NULL, created INTEGER NOT NULL, updated INTEGER NOT NULL, version INTEGER NOT NULL DEFAULT 1, claim TEXT NOT NULL DEFAULT '');
--> statement-breakpoint
CREATE TABLE project_members (project TEXT NOT NULL, user TEXT NOT NULL, PRIMARY KEY(project,user));
--> statement-breakpoint
CREATE TABLE project_nodes (id TEXT PRIMARY KEY, project TEXT NOT NULL, name TEXT NOT NULL, assignee TEXT NOT NULL DEFAULT '', due TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'todo', progress INTEGER NOT NULL DEFAULT 0, task TEXT NOT NULL DEFAULT '', version INTEGER NOT NULL DEFAULT 1, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE project_sessions (id TEXT PRIMARY KEY, project TEXT NOT NULL, name TEXT NOT NULL, owner TEXT NOT NULL, participants TEXT NOT NULL DEFAULT '[]', closed INTEGER NOT NULL DEFAULT 0, summary TEXT NOT NULL DEFAULT '', confirmed INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1, created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE project_messages (seq INTEGER PRIMARY KEY AUTOINCREMENT, project TEXT NOT NULL, session TEXT NOT NULL DEFAULT '', sender TEXT NOT NULL, author TEXT NOT NULL, body TEXT NOT NULL, created INTEGER NOT NULL, held INTEGER NOT NULL DEFAULT 0);
--> statement-breakpoint
CREATE INDEX project_messages_scope ON project_messages(project,session,seq);
--> statement-breakpoint
CREATE TABLE project_files (project TEXT NOT NULL, item TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'library', PRIMARY KEY(project,item,source));
--> statement-breakpoint
CREATE TABLE project_reads (project TEXT NOT NULL, session TEXT NOT NULL DEFAULT '', user TEXT NOT NULL, lastseq INTEGER NOT NULL DEFAULT 0, PRIMARY KEY(project,session,user));
