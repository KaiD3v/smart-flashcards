import type { ReviewReminderEmailPayload } from "./mail.types";

const COLORS = {
  primary: "#6d28d9",
  primaryDark: "#5b21b6",
  primaryLight: "#ede9fe",
  background: "#f1f5f9",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function pluralCards(count: number): string {
  return count === 1 ? "flashcard" : "flashcards";
}

export function buildReviewReminderText(payload: ReviewReminderEmailPayload): string {
  const lines = [
    `Olá, ${payload.userName}!`,
    "",
    `Você tem ${payload.totalDueCount} ${pluralCards(payload.totalDueCount)} para revisar no StudyHub.`,
    "",
  ];

  for (const subject of payload.subjects) {
    lines.push(`• ${subject.subjectName} — ${subject.dueCount} ${pluralCards(subject.dueCount)}`);
    lines.push(`  ${subject.reviewUrl}`);
    lines.push("");
  }

  lines.push("Bons estudos!");
  lines.push("— Equipe StudyHub");
  return lines.join("\n");
}

export function buildReviewReminderHtml(payload: ReviewReminderEmailPayload): string {
  const subjectBlocks = payload.subjects
    .map(
      (subject) => `
        <tr>
          <td style="padding: 12px 16px; border: 1px solid ${COLORS.border}; border-radius: 12px; background-color: #fafafa;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td style="vertical-align: middle;">
                  <p style="margin: 0 0 4px; font-size: 16px; font-weight: 600; color: ${COLORS.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${escapeHtml(subject.subjectName)}
                  </p>
                  <p style="margin: 0; font-size: 14px; color: ${COLORS.muted}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    ${subject.dueCount} ${pluralCards(subject.dueCount)} aguardando revisão
                  </p>
                </td>
                <td style="vertical-align: middle; text-align: right; width: 120px;">
                  <a href="${escapeHtml(subject.reviewUrl)}" style="display: inline-block; padding: 10px 18px; background-color: ${COLORS.primary}; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                    Revisar
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="height: 10px; font-size: 0; line-height: 0;">&nbsp;</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>StudyHub — revisão pendente</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background}; -webkit-font-smoothing: antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; background-color: ${COLORS.card}; border-radius: 16px; border: 1px solid ${COLORS.border}; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);">
          <!-- Header -->
          <tr>
            <td style="padding: 28px 32px 24px; background: linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%);">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.85); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      StudyHub
                    </p>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; line-height: 1.3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      Hora de revisar
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 28px 32px 8px;">
              <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: ${COLORS.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Olá, <strong>${escapeHtml(payload.userName)}</strong>!
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; background-color: ${COLORS.primaryLight}; border-radius: 12px; border: 1px solid #ddd6fe;">
                <tr>
                  <td style="padding: 20px 24px; text-align: center;">
                    <p style="margin: 0 0 4px; font-size: 36px; font-weight: 800; color: ${COLORS.primary}; line-height: 1; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      ${payload.totalDueCount}
                    </p>
                    <p style="margin: 0; font-size: 15px; color: ${COLORS.primaryDark}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                      ${pluralCards(payload.totalDueCount)} para revisar hoje
                    </p>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: ${COLORS.muted}; text-transform: uppercase; letter-spacing: 0.04em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Por matéria
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                ${subjectBlocks}
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 8px 32px 28px;">
              <p style="margin: 0 0 8px; font-size: 15px; color: ${COLORS.text}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Bons estudos!
              </p>
              <p style="margin: 0; font-size: 12px; color: ${COLORS.muted}; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                Você recebeu este e-mail porque há flashcards vencidos na sua conta StudyHub.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin: 16px 0 0; font-size: 11px; color: #94a3b8; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
          © StudyHub
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}
