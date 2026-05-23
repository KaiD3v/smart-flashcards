export type MailProvider = "smtp" | "mailtrap";

export type MailSmtpConfig = {
  provider: "smtp";
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  frontendUrl: string;
};

export type MailMailtrapConfig = {
  provider: "mailtrap";
  apiToken: string;
  sandbox: boolean;
  testInboxId?: number;
  from: string;
  frontendUrl: string;
};

export type MailConfig = MailSmtpConfig | MailMailtrapConfig;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseMailProvider(): MailProvider {
  const raw = process.env.MAIL_PROVIDER?.trim().toLowerCase();
  if (raw === "mailtrap" || raw === "smtp") {
    return raw;
  }
  if (process.env.MAILTRAP_API_TOKEN?.trim()) {
    return "mailtrap";
  }
  return "smtp";
}

function loadMailtrapConfig(from: string, frontendUrl: string): MailMailtrapConfig {
  const apiToken = requireEnv("MAILTRAP_API_TOKEN");
  const sandbox = process.env.MAILTRAP_USE_SANDBOX?.trim().toLowerCase() !== "false";
  const inboxIdRaw = process.env.MAILTRAP_INBOX_ID?.trim();

  let testInboxId: number | undefined;
  if (inboxIdRaw) {
    testInboxId = Number(inboxIdRaw);
    if (!Number.isInteger(testInboxId) || testInboxId <= 0) {
      throw new Error(`Invalid MAILTRAP_INBOX_ID: ${inboxIdRaw}`);
    }
  }

  if (sandbox && testInboxId === undefined) {
    throw new Error(
      "MAILTRAP_INBOX_ID is required when MAILTRAP_USE_SANDBOX is true (Email Sandbox)."
    );
  }

  return {
    provider: "mailtrap",
    apiToken,
    sandbox,
    testInboxId,
    from,
    frontendUrl,
  };
}

function loadSmtpConfig(from: string, frontendUrl: string): MailSmtpConfig {
  const smtpPortRaw = requireEnv("MAIL_SMTP_PORT");
  const smtpPort = Number(smtpPortRaw);
  if (!Number.isFinite(smtpPort) || smtpPort <= 0) {
    throw new Error(`Invalid MAIL_SMTP_PORT: ${smtpPortRaw}`);
  }

  return {
    provider: "smtp",
    smtpHost: requireEnv("MAIL_SMTP_HOST"),
    smtpPort,
    smtpUser: requireEnv("MAIL_SMTP_USER"),
    smtpPass: requireEnv("MAIL_SMTP_PASS"),
    from,
    frontendUrl,
  };
}

export function loadMailConfig(): MailConfig {
  const from = requireEnv("MAIL_FROM");
  const frontendUrl = requireEnv("MAIL_FRONTEND_URL").replace(/\/$/, "");
  const provider = parseMailProvider();

  if (provider === "mailtrap") {
    return loadMailtrapConfig(from, frontendUrl);
  }

  return loadSmtpConfig(from, frontendUrl);
}

export function isMailConfigured(): boolean {
  const from = process.env.MAIL_FROM?.trim();
  const frontendUrl = process.env.MAIL_FRONTEND_URL?.trim();
  if (!from || !frontendUrl) {
    return false;
  }

  const provider = parseMailProvider();

  if (provider === "mailtrap") {
    const token = process.env.MAILTRAP_API_TOKEN?.trim();
    if (!token) {
      return false;
    }
    const sandbox = process.env.MAILTRAP_USE_SANDBOX?.trim().toLowerCase() !== "false";
    if (sandbox) {
      const inboxId = process.env.MAILTRAP_INBOX_ID?.trim();
      return typeof inboxId === "string" && inboxId.length > 0;
    }
    return true;
  }

  const smtpKeys = [
    "MAIL_SMTP_HOST",
    "MAIL_SMTP_PORT",
    "MAIL_SMTP_USER",
    "MAIL_SMTP_PASS",
  ] as const;

  return smtpKeys.every((key) => {
    const value = process.env[key]?.trim();
    return typeof value === "string" && value.length > 0;
  });
}
