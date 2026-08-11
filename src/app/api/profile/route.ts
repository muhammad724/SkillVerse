import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/supabase/auth-user";

const updateSchema = z.object({
  fullName: z.string().min(2).max(80),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).transform(value => value.toLowerCase()),
  bio: z.string().max(300).optional(),
  headline: z.string().max(100).optional(),
  phone: z.string().max(30).optional(),
  gender: z.enum(["", "female", "male", "non-binary", "prefer-not-to-say"]),
  location: z.string().max(100).optional(),
  skills: z.array(z.string().min(1).max(40)).max(20),
  githubUrl: z.url().optional().or(z.literal("")),
  linkedinUrl: z.url().optional().or(z.literal("")),
  isPublic: z.boolean(),
  soundEnabled: z.boolean(),
  terminalTheme: z.string().max(30),
});

export async function GET(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in." }, { status: 401 });
  const profile = await prisma.user.findUnique({
    where: { authId: auth.id },
    include: { careers: { where: { active: true }, include: { career: true }, take: 1 } },
  });
  return NextResponse.json({
    profile,
    auth: { email: auth.email, fullName: auth.user_metadata.full_name, username: auth.user_metadata.username },
  });
}

export async function PATCH(request: Request) {
  const auth = await getAuthenticatedUser(request);
  if (!auth) return NextResponse.json({ message: "Please log in." }, { status: 401 });
  const input = updateSchema.safeParse(await request.json());
  if (!input.success) return NextResponse.json({ message: "Please check your profile fields.", issues: input.error.issues }, { status: 400 });
  try {
    const profile = await prisma.user.update({
      where: { authId: auth.id },
      data: { ...input.data, bio: input.data.bio || null, headline: input.data.headline || null, phone: input.data.phone || null, gender: input.data.gender || null, location: input.data.location || null, skills: [...new Set(input.data.skills.map(skill => skill.trim()).filter(Boolean))], githubUrl: input.data.githubUrl || null, linkedinUrl: input.data.linkedinUrl || null },
    });
    return NextResponse.json({ profile });
  } catch {
    return NextResponse.json({ message: "That username is already taken or the profile is unavailable." }, { status: 409 });
  }
}
