# Email membership and navigation

Administrators add exact emails through /api/team-invites. These per-team invitations are stored in email_team_invites (custom migration 0015), not by replacing the global ALLOWED_EMAILS secret. Keep existing secrets unchanged.

emailAllowed permits the original static allowlist, active exact-email invitations, or current memberships. Supabase must verify email ownership before claimEmailInvites provisions member/viewer access. User metadata is used only as a display name, never a role. Claims are idempotent. Revoking pending invitations stops provisioning; removing a member also disables the matching invite so login cannot silently rejoin.

Remote Auth user checks are deduplicated by the complete access token in a bounded in-memory cache for three seconds. Membership, profile, and authorization checks remain fresh in D1. Cache never crosses tokens and never accepts an unverified JWT. Do not extend this cache lifetime without reviewing revocation behavior.

Task SSR prepares initial authorized workspace data and skips the duplicate initial browser request. ModuleNav uses the public router push API directly (the bundled Link dynamic loader was incompatible in production) with an unsaved-edit guard, retains sidebar scroll, and leaves the root chat drawer mounted between route transitions. Progress-only task updates retain their current ordering within priority/deadline groups.

