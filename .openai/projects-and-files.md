# Projects and file space

Project data is managed by custom immutable D1 migrations 0013 and 0014; do not regenerate or replay their CREATE TABLE statements. These are intentionally SQL-managed tables outside db/schema.ts. Preserve them during schema updates.

Project-only guests are authorized against explicit session participants, not project membership. File links never grant access. Project uploads snapshot the current project member list into file ACLs; membership changes do not implicitly change historical file ACLs. Review file permissions separately when changing project membership.

No external AI provider is configured. User explicitly chose human confirmation and basic organization. File-name suggestions are not proof of identity or finality. Content comparisons are bounded textual comparisons, not semantic or legal review.

File grouping and final confirmation require admin or category-specific delegation. Archive copies preserve a disclosed snapshot of effective readers as a custom file ACL and keep provenance. Task files keep original references. Deletions remain soft and recoverable by admins. No automatic permanent deletion.

The browser cannot select desktop WeChat contacts. Current share preparation only copies user-reviewed text and serves an authenticated ZIP. Never auto-send external communications.
