import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getAdmin } from "@/lib/admin";

export async function POST(request: Request) {
  const admin = await getAdmin(request);
  if (!admin.ok) {
    return NextResponse.json({ message: admin.error }, { status: admin.status });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "SkillVerse <onboarding@resend.dev>";
  if (!apiKey) {
    return NextResponse.json(
      { message: "Resend is not configured. Add RESEND_API_KEY to the server environment." },
      { status: 503 },
    );
  }

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from,
      to: admin.user.email,
      subject: "SkillVerse email integration verified",
      html: `<p>Congratulations! Your <strong>SkillVerse</strong> Resend email integration is working.</p><p>This test was requested by an authenticated SkillVerse administrator.</p>`,
    });

    if (error) {
      console.error("SkillVerse Resend error", error.message);
      return NextResponse.json({ message: error.message }, { status: 502 });
    }

    return NextResponse.json({
      sent: true,
      emailId: data?.id,
      recipient: admin.user.email,
      message: "Test email sent. Check Resend Emails for its delivery status.",
    });
  } catch (error) {
    console.error("SkillVerse Resend error", error instanceof Error ? error.message : "Unknown email error");
    return NextResponse.json({ message: "The test email could not be sent." }, { status: 502 });
  }
}
