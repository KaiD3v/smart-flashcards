import nodemailer from "nodemailer";
import { MailtrapTransport } from "mailtrap";
import type { Transporter } from "nodemailer";
import { loadMailConfig, type MailConfig, type MailMailtrapConfig } from "./mail.config";
import type { ReviewReminderEmailPayload } from "./mail.types";
import {
  buildReviewReminderHtml,
  buildReviewReminderText,
} from "./review-reminder.template";

function createSmtpTransporter(config: MailConfig & { provider: "smtp" }): Transporter {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

function createMailtrapTransporter(config: MailMailtrapConfig): Transporter {
  return nodemailer.createTransport(
    MailtrapTransport({
      token: config.apiToken,
      sandbox: config.sandbox,
      testInboxId: config.testInboxId,
    })
  );
}

export class MailService {
  private readonly config: MailConfig;
  private transporter: Transporter | null = null;

  constructor(config?: MailConfig) {
    this.config = config ?? loadMailConfig();
    if (this.config.provider === "mailtrap") {
      const mode = this.config.sandbox ? "sandbox" : "sending";
      console.log(`[mail] Mailtrap transport (${mode})`);
    }
  }

  private getTransporter(): Transporter {
    if (!this.transporter) {
      this.transporter =
        this.config.provider === "mailtrap"
          ? createMailtrapTransporter(this.config)
          : createSmtpTransporter(this.config);
    }
    return this.transporter;
  }

  private handleSendError(error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("Unauthorized")) {
      const inboxHint =
        this.config.provider === "mailtrap" && this.config.sandbox
          ? ` Confira MAILTRAP_INBOX_ID (ID da inbox em Mailtrap → Sandboxes → Integration; inbox errada também retorna Unauthorized).`
          : "";
      throw new Error(
        `Mailtrap API retornou Unauthorized.${inboxHint} Token: https://mailtrap.io/api-tokens (permissão Email Sandbox). Alternativa: MAIL_PROVIDER=smtp.`,
        { cause: error }
      );
    }
    throw error;
  }

  async sendReviewReminder(payload: ReviewReminderEmailPayload): Promise<void> {
    const cardLabel = payload.totalDueCount === 1 ? "flashcard" : "flashcards";
    const subjectLine = `StudyHub: ${payload.totalDueCount} ${cardLabel} para revisar`;
    let info;
    try {
      info = await this.getTransporter().sendMail({
      from: this.config.from,
      to: payload.to,
      subject: subjectLine,
      text: buildReviewReminderText(payload),
      html: buildReviewReminderHtml(payload),
      ...(this.config.provider === "mailtrap" && this.config.sandbox
        ? { category: "StudyHub Review Reminder" }
        : {}),
      });
    } catch (error) {
      this.handleSendError(error);
    }

    if (this.config.provider === "smtp") {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`[mail] Preview URL: ${previewUrl}`);
      }
    } else if (this.config.provider === "mailtrap" && this.config.sandbox) {
      console.log(
        `[mail] Mailtrap sandbox — veja o e-mail em https://mailtrap.io/sandboxes (inbox ${this.config.testInboxId ?? "?"})`
      );
    }
  }

  buildSubjectReviewUrl(subjectId: string): string {
    return `${this.config.frontendUrl}/subjects/${subjectId}/review`;
  }
}
