import type { AuthUser } from "./auth";
export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ApprovalSummary = { id:string;status:ApprovalStatus;requestedAt:string;requester:AuthUser;policyEvaluation:{decision:"REQUIRE_APPROVAL";riskAssessment:{score:number;level:string;simulationRun:{plan:{request:{id:string;prompt:string;environment:string}}}}}};
export type ApprovalRequest = {id:string;policyEvaluationId:string;requesterId:string;reviewerId:string|null;status:ApprovalStatus;reviewComment:string|null;requestedAt:string;decidedAt:string|null;createdAt:string;updatedAt:string;requester:AuthUser;reviewer:AuthUser|null;policyEvaluation?:{riskAssessment:Record<string,unknown>}};
