export type MailConfig = {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  frontendUrl: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadMailConfig(): MailConfig {
  const smtpPortRaw = requireEnv("MAIL_SMTP_PORT");
  const smtpPort = Number(smtpPortRaw);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error(`Invalid MAIL_SMTP_PORT: ${smtpPortRaw}`);
  }

  const frontendUrl = requireEnv("MAIL_FRONTEND_URL").replace(/\/$/, "");

  return {
    smtpHost: requireEnv("MAIL_SMTP_HOST"),
    smtpPort,
    smtpUser: requireEnv("MAIL_SMTP_USER"),
    smtpPass: requireEnv("MAIL_SMTP_PASS"),
    from: requireEnv("MAIL_FROM"),
    frontendUrl,
  };
}

export function isMailConfigured(): boolean {
  const required = [
    "MAIL_SMTP_HOST",
    "MAIL_SMTP_PORT",
    "MAIL_SMTP_USER",
    "MAIL_SMTP_PASS",
    "MAIL_FROM",
    "MAIL_FRONTEND_URL",
  ];
  return required.every((key) => {
    const value = process.env[key]?.trim();
    return typeof value === "string" && value.length > 0;
  });
}
