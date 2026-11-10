import { Role } from "@prisma/client";
import { handleRouteError, json, readJson, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { sendMail } from "@/lib/server/mail";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireUser(request, [Role.ADMIN, Role.STAFF]);
    const { id } = await context.params;
    const body = await readJson<{ body?: string; sendEmail?: boolean }>(
      request,
    );
    const text = body.body?.trim() || "";
    if (text.length < 2) throw new HttpError(400, "Reply body required");

    const message = await prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new HttpError(404, "Message not found");

    const reply = await prisma.messageReply.create({
      data: { messageId: id, body: text },
    });

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: "REPLIED",
        read: true,
      },
      include: { replies: { orderBy: { createdAt: "asc" } } },
    });

    let emailed = false;
    let emailNote: string | undefined;
    if (body.sendEmail !== false) {
      try {
        const storeName = "Rose Glow";
        const result = await sendMail({
          to: message.email,
          subject: `Re: ${message.subject || "Your message to Rose Glow"}`,
          text: [
            `Hi ${message.name},`,
            "",
            text,
            "",
            `— ${user.name || storeName}`,
            storeName,
            "",
            "---",
            "Original message:",
            message.message,
          ].join("\n"),
          html: `
            <p>Hi ${escapeHtml(message.name)},</p>
            <p>${escapeHtml(text).replace(/\n/g, "<br/>")}</p>
            <p>— ${escapeHtml(user.name || storeName)}<br/>${storeName}</p>
            <hr/>
            <p style="color:#666;font-size:12px"><strong>Original message</strong><br/>${escapeHtml(message.message).replace(/\n/g, "<br/>")}</p>
          `,
        });
        emailed = result.sent;
        if (!result.sent) emailNote = result.reason;
      } catch (err) {
        emailNote =
          err instanceof Error ? err.message : "Failed to send email";
      }
    }

    return json({ message: updated, reply, emailed, emailNote }, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
