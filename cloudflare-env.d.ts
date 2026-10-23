declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
  }
}

declare namespace Cloudflare { interface Env { SUPABASE_URL?: string; SUPABASE_PUBLISHABLE_KEY?: string; ALLOWED_EMAILS?: string; TEAM_ADMIN_EMAIL?: string; } }
