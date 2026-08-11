import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

export async function getAdmin(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return { ok: false as const, error: "Please sign in.", status: 401 as const };
  const user = await prisma.user.findFirst({
    where: { OR: [{ authId: auth.id }, ...(auth.email ? [{ email: auth.email }] : [])] },
  });
  if (!user?.isAdmin) return { ok: false as const, error: "Administrator access is required.", status: 403 as const };
  return { ok: true as const, user };
}
