export type CheckStatus = "ok" | "warn" | "error";

export type CheckItem = {
  label: string;
  status: CheckStatus;
  detail?: string;
};

export type DevCheckResult = {
  generatedAt: string;
  envChecks: CheckItem[];
  tableChecks: CheckItem[];
  storageChecks: CheckItem[];
  contentChecks: CheckItem[];
  miscChecks: CheckItem[];
};
