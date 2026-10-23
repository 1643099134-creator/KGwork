-- Custom SQL migration file, put your code below! --
-- Keep assistant history separate from human private conversation watermarks.
INSERT INTO chat_messages (team,room,sender,recipient,author,body,created,held)
SELECT cm.team,'assistant:'||m.user,cm.sender,m.user,cm.author,cm.body,cm.created,cm.held
FROM chat_messages cm JOIN members m ON m.team=cm.team AND m.role='admin'
WHERE cm.sender='__assistant__' AND cm.room LIKE 'private:%' AND m.user!=cm.recipient
AND NOT EXISTS (SELECT 1 FROM chat_messages old WHERE old.team=cm.team AND old.room='assistant:'||m.user AND old.sender=cm.sender AND old.created=cm.created AND old.body=cm.body);
--> statement-breakpoint
UPDATE chat_messages SET room='assistant:'||recipient WHERE sender='__assistant__' AND room LIKE 'private:%';
