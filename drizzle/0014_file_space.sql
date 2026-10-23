-- Custom SQL migration file, put your code below! --
CREATE TABLE file_families (id TEXT PRIMARY KEY, team TEXT NOT NULL, name TEXT NOT NULL, category TEXT NOT NULL DEFAULT '项目文件', color TEXT NOT NULL DEFAULT 'sage', created INTEGER NOT NULL);
--> statement-breakpoint
CREATE TABLE file_versions (team TEXT NOT NULL, item TEXT NOT NULL, source TEXT NOT NULL, family TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'working', note TEXT NOT NULL DEFAULT '', actor TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(team,item,source));
--> statement-breakpoint
CREATE TABLE file_delegates (team TEXT NOT NULL, user TEXT NOT NULL, category TEXT NOT NULL, PRIMARY KEY(team,user,category));
--> statement-breakpoint
CREATE TABLE file_audit (id TEXT PRIMARY KEY, team TEXT NOT NULL, item TEXT NOT NULL, source TEXT NOT NULL, action TEXT NOT NULL, actor TEXT NOT NULL, created INTEGER NOT NULL, detail TEXT NOT NULL DEFAULT '');
