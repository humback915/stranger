import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** service_role 키를 사용하는 어드민 클라이언트 (RLS 우회) */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
