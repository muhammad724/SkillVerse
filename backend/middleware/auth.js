const { createClient } = require("@supabase/supabase-js");
const prisma = require("../config/database");

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", { auth: { persistSession: false, autoRefreshToken: false } });

async function requireAdmin(req, res, next) {
  try {
    const authorization = req.get("authorization");
    if (!authorization?.startsWith("Bearer ")) return res.status(401).json({ message: "Bearer authentication is required." });
    const { data: { user }, error } = await supabase.auth.getUser(authorization.slice(7));
    if (error || !user) return res.status(401).json({ message: "The access token is invalid or expired." });
    const profile = await prisma.user.findFirst({ where: { OR: [{ authId: user.id }, ...(user.email ? [{ email: user.email }] : [])] } });
    if (!profile?.isAdmin) return res.status(403).json({ message: "Administrator access is required." });
    req.user = profile;
    next();
  } catch (error) { next(error); }
}

module.exports = { requireAdmin };
