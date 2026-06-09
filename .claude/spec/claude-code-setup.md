# Claude Code setup (Part E + F)

Goal: Claude Code writes the code, owns the database, exercises payments in **test mode**, drives the browser to verify its own work, opens PRs, and deploys to Vercel — with you approving, not typing.

## E1. Plugins (official marketplace)

`claude-plugins-official` is available by default. Install:

```
/plugin install github@claude-plugins-official      # repo: branches, PRs, issues
/plugin install vercel@claude-plugins-official       # deploys, env, logs
/plugin install supabase@claude-plugins-official     # DB management (bundles the MCP)
```

Optional:
```
/plugin install sentry@claude-plugins-official       # error triage after launch
```
Browse more with `/plugin` → **Discover**. If a plugin isn't found: `/plugin marketplace update claude-plugins-official`.

## E2. MCP servers (the agent's hands)

Wire directly via CLI if not using the plugin:

**Supabase** (create tables, run migrations, generate TS types, read logs):
```
claude mcp add --transport http supabase "https://mcp.supabase.com/mcp?project_ref=<YOUR_PROJECT_REF>"
```
- Scope to one project via `project_ref`. Build needs write access (schema creation). For production data later, append `&read_only=true`.
- Service-role context bypasses RLS — treat as admin, keep scoped, don't point at prod casually.

**Razorpay** (create orders/payment links, inspect payments/refunds — **TEST** keys):
```
# merchant token = base64 of "KEY_ID:KEY_SECRET"
claude mcp add --transport http razorpay "https://mcp.razorpay.com/mcp" \
  --header "Authorization: Basic <BASE64_TEST_KEY:SECRET>"
```

**Playwright** (open the site, click through checkout, screenshot, verify):
```
claude mcp add playwright npx -- @playwright/mcp@latest
```

Verify: `/mcp` (servers + auth state) and `claude mcp list`.

## E3. Repo `CLAUDE.md`

Keep a `CLAUDE.md` at repo root referencing: the A1 structure, that the data model + specs live under `.claude/spec/` (read before touching the DB), the guardrails and Definition of Done (see [`conventions.md`](conventions.md)).

## E4. Per-feature working loop

1. Paste one feature spec (from `phase-*/`) into Claude Code.
2. Claude proposes a plan + migration (if any) → you approve.
3. Claude applies the migration via **Supabase MCP**, generates types, writes the code.
4. Claude runs **Playwright** to exercise the flow and screenshots it.
5. Claude opens a PR via the **GitHub** plugin; **Vercel** builds a preview.
6. You review the preview; merge → production deploy.

Small, verifiable, reversible — the agent self-checks before you look.

## E5. Skills worth enabling

- A TypeScript language-server plugin (better cross-file refactors).
- Keep the specs in `.claude/spec/` so Claude reads them instead of guessing.
