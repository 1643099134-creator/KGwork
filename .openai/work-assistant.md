# Work assistant runtime

Production task data remains in the Site D1 database. The first release produces rule-based summaries from recorded task state; no external language model receives user content.

POST /api/assistant/tick accepts only the ASSISTANT_CRON_SECRET runtime bearer secret. It processes reminders and daily digests and records assistant_health. No visitor identity is assumed for this narrowly scoped endpoint. The token is stored in Sites secret configuration and Supabase Vault, never source or browser code.

The Supabase project already used by this app invokes the endpoint every minute via pg_cron and pg_net. The job reads the token from the named Vault secret team_paper_notes_assistant_cron. It does not read task content from Supabase or expose secrets in cron text. Verify HTTP status and scheduler health after publication, and inspect cron job run details on failures.

All task dates/times use Asia/Shanghai (UTC+08:00). Defaults: reminders between 09:00 and 19:00; daily digest 18:00. Admins may change these in /assistant. A task plan can add intermediate reminders; due-minus-two-hours and due-time checks are automatic. There are at most two automatic reminders per task, assignee and local date. Closed/completed/archived/review tasks are skipped. Unassigned tasks notify admins. Each emitted event, notification and chat write is committed as an idempotent D1 batch.

Assistant reminders and digests go to each recipient’s separate assistant room. Human task feedback remains in the existing assignee private thread. Human and assistant messages have independent unread counters and read watermarks. Ordinary members can see only their own assistant events and assigned tasks. Assistant rooms cannot be used to send arbitrary messages. Do not widen access to files or conversation history.

The /api/assistant review actions validate current task version and membership. Only administrators approve or return submissions for revision. Original materials and result files keep their existing permissions and storage locations.

## Project document review (current release)
Project file records, version metadata, annotations and review receipts are stored in Site D1; bytes remain in R2 through the authenticated file library. Project access and source file/task access are both required. Session-only guests cannot read project files. Linking does not broaden the original file ACL.

`/api/project-files` supports direct multipart uploads, linking, exact-version annotations, classification, receipt registration, snoozing and review decisions. Originals are immutable uploads; a new revision is a separate object. Version numbers are stored per project series. Upload retries use a client UUID; notices for one upload batch are merged. Project review approval does not complete a task or publish files externally.

Review state and reading receipts are independent: an explicit preview registers opened, not approved. Deferred review keeps the item pending. Uploads can choose a review due time (default 24 hours, Asia/Shanghai); due values for existing legacy rows fall back to upload plus 24 hours. The existing authenticated tick checks due project reviews during team working hours. It groups overdue items by project and reviewer/submitter, sends at most one reminder per recipient/project/local date, and stops once no pending review remains. Notices go to the separate assistant room and remain distinct from human conversation unread watermarks. In-site overdue prompts use the same effective-access calculation and can be dismissed on that device for two hours; per-file server snooze is separate.

Run `node tests/project-files.cjs` with Node 24 from the checkout to exercise review receipt, version chronology, return/resubmit, reminder deduplication, ACL and revocation behavior against an in-memory migrated database. Browser QA uses synthetic local records only.
