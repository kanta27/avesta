// Type-only barrel — safe to import from anywhere (client or server).
// Import the actual clients explicitly so server-only code never leaks into
// the browser bundle:
//   import { createClient } from "@/lib/supabase/client"  // browser
//   import { createClient } from "@/lib/supabase/server"  // server (RLS)
//   import { createAdminClient } from "@/lib/supabase/admin" // service-role
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  CompositeTypes,
} from "./types";
