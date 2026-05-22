import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { loadMailConfig, type MailConfig } from "./mail.config";
import type { ReviewReminderEmailPayload } from "./mail.types";

function buildReviewReminderText(payload: ReviewReminderEmailPayload): string {
  const lines = [
    `Olá, ${payload.userName}!`,
    "",
    `Você tem ${payload.totalDueCount} flashcard(s) para revisar no StudyHub.`,
    "",
  ];

  for (const subject of payload.subjects) {
    lines.push(
      `- ${subject.subjectName}: ${subject.dueCount} card(s) — ${subject.reviewUrl}`
    );
  }

  lines.push("", "Bons estudos!");
  return lines.join("\n");
}

function buildReviewReminderHtml(payload: ReviewReminderEmailPayload): string {
  const subjectRows = payload.subjects
    .map(
      (subject) =>
        `<li><strong>${escapeHtml(subject.subjectName)}</strong>: ${subject.dueCount} card(s) — <a href="${escapeHtml(subject.reviewUrl)}">Revisar</a></li>`
    )
    .join("");

  return `
    <p>Olá, ${escapeHtml(payload.userName)}!</p>
    <p>Você tem <strong>${payload.totalDueCount}</strong> flashcard(s) para revisar no StudyHub.</p>
    <ul>${subjectRows}</ul>
    <p>Bons estudos!</p>
  `.trim();
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export class MailService {
  private readonly config: MailConfig;
  private transporter: Transporter | null = null;

  constructor(config?: MailConfig) {
    this.config = config ?? loadMailConfig();
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: this.config.smtpHost,
        port: this.config.smtpPort,
        secure: this.config.smtpPort === 465,
        auth: {
          user: this.config.smtpUser,
          pass: this.config.smtpPass,
        },
      });
    }
    return this.transporter;
  }

  async sendReviewReminder(payload: ReviewReminderEmailPayload): Promise<void> {
    const subjectLine = `StudyHub: você tem ${payload.totalDueCount} flashcard(s) para revisar`;
    const info = await this.getTransporter().sendMail({
      from: this.config.from,
      to: payload.to,
      subject: subjectLine,
      text: buildReviewReminderText(payload),
      html: buildReviewReminderHtml(payload),
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[mail] Preview URL: ${previewUrl}`);
    }
  }

  buildSubjectReviewUrl(subjectId: string): string {
    return `${this.config.frontendUrl}/subjects/${subjectId}/review`;
  }
}
