declare interface Env {
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
}

type AccessIdentity = {
  email?: string;
  name?: string;
};

type AccessContext = {
  getIdentity(): Promise<AccessIdentity | null>;
};

declare interface ExecutionContext {
  access?: AccessContext;
}
