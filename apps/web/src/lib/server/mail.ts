/**
 * Outbound email helper.
 * Configure either:
 *   RESEND_API_KEY + MAIL_FROM
 * or leave unset — replies still save in admin, email is skipped.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.MAIL_FROM?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "Rose Glow <onboarding@resend.dev>";

  if (!apiKey) {
    return { sent: false as const, reason: "RESEND_API_KEY not configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [opts.to],
      subject: opts.subject,
      text: opts.text,
      html: opts.html || undefined,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email failed (${res.status}): ${body.slice(0, 200)}`);
  }

  return { sent: true as const };
}
