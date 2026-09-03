export type PlannerProvider = "SIMULATION";
export type PlanStatus = "GENERATED" | "INVALID";
export type PlanActionType = "QUERY_RESOURCE" | "VALIDATE_SCOPE" | "CREATE_RESOURCE" | "UPDATE_RESOURCE" | "ARCHIVE_RESOURCE" | "DELETE_RESOURCE";
export type PlanResourceType = "INVOICE" | "CUSTOMER_ACCOUNT" | "USER_ACCOUNT" | "FILE" | "RECORD";

export type PlanTarget = Record<string, string | number | boolean | null>;

export type PlanAction = {
  id: string;
  position: number;
  type: PlanActionType;
  resourceType: PlanResourceType;
  description: string;
  target: PlanTarget;
  destructive: boolean;
  reversible: boolean;
  estimatedScope: string | null;
  reason: string;
  createdAt: string;
};

export type ExecutionPlan = {
  id: string;
  requestId: string;
  provider: PlannerProvider;
  summary: string;
  status: PlanStatus;
  actions: PlanAction[];
  createdAt: string;
  updatedAt: string;
};
