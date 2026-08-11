import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(request: Request): Promise<User | null> {
  const supabase = await createClient();
  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;
  const { data: { user }, error } = token ? await supabase.auth.getUser(token) : await supabase.auth.getUser();
  return error ? null : user;
}
