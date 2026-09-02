export type RequestStatus = "SUBMITTED" | "PLANNING" | "PLANNED" | "FAILED" | "CANCELLED";

export type RequestEnvironment = "DEVELOPMENT" | "STAGING" | "PRODUCTION";

export type ShadowRequest = {
  id: string;
  prompt: string;
  status: RequestStatus;
  environment: RequestEnvironment;
  createdAt: string;
  updatedAt: string;
};

export type RequestPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};
