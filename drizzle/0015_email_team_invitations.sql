-- Custom SQL migration file, put your code below! --
CREATE TABLE email_team_invites (team TEXT NOT NULL, email TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'member', active INTEGER NOT NULL DEFAULT 1, claimed TEXT NOT NULL DEFAULT '', creator TEXT NOT NULL, created INTEGER NOT NULL, PRIMARY KEY(team,email));
