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
