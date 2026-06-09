-- =============================================================================
-- Harden A2 helper functions — clears Supabase security advisor warnings.
--
-- Two pre-existing findings (not introduced by A3):
--   1. public.rls_auto_enable() is a SECURITY DEFINER event-trigger function
--      that is EXECUTE-able by anon/authenticated via PostgREST RPC. It is not
--      practically exploitable (pg_event_trigger_ddl_commands() errors outside
--      an event-trigger context), but the public EXECUTE grant is needless
--      surface. Revoke it — the event trigger still fires on DDL regardless of
--      who can call the function directly.
--   2. public.set_updated_at() has a mutable search_path. Pin it to '' so the
--      function resolves objects only via the implicit pg_catalog, immune to
--      search_path injection. (now() lives in pg_catalog, so the body is fine.)
--
-- Non-destructive: no data or schema-shape changes.
-- =============================================================================

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

alter function public.set_updated_at() set search_path = '';
