import type { ApprovalRequest,ApprovalStatus,ApprovalSummary } from "../types/approval";import { apiRequest } from "./api-client";
export const createApproval=(id:string)=>apiRequest<{approval:ApprovalRequest}>(`/api/requests/${encodeURIComponent(id)}/approval`,{method:"POST"}).then(x=>x.approval);
export const getRequestApproval=(id:string)=>apiRequest<{approval:ApprovalRequest}>(`/api/requests/${encodeURIComponent(id)}/approval`).then(x=>x.approval);
export const listApprovals=(status:ApprovalStatus="PENDING")=>apiRequest<{approvals:ApprovalSummary[]}>(`/api/approvals?status=${status}`).then(x=>x.approvals);
export const getApproval=(id:string)=>apiRequest<{approval:ApprovalRequest}>(`/api/approvals/${encodeURIComponent(id)}`).then(x=>x.approval);
const decide=(id:string,action:"approve"|"reject",comment?:string)=>apiRequest<{approval:ApprovalRequest}>(`/api/approvals/${encodeURIComponent(id)}/${action}`,{method:"POST",...(comment?.trim()?{headers:{"content-type":"application/json"},body:JSON.stringify({comment:comment.trim()})}:{})}).then(x=>x.approval);
export const approveApproval=(id:string,comment?:string)=>decide(id,"approve",comment);export const rejectApproval=(id:string,comment?:string)=>decide(id,"reject",comment);
