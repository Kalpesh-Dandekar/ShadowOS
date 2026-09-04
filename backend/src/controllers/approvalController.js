import { approveRequest, createOwnedApproval, getApprovalDetail, getOwnedRequestApproval, listReviewerApprovals, rejectRequest } from "../services/approval/approvalService.js";
export async function createApproval(req, res) { res.status(201).json({ approval: await createOwnedApproval(req.user.id, req.validatedParams.id) }); }
export async function getRequestApproval(req, res) { res.json({ approval: await getOwnedRequestApproval(req.user.id, req.validatedParams.id) }); }
export async function list(req, res) { res.json({ approvals: await listReviewerApprovals(req.validatedQuery.status) }); }
export async function getApproval(req, res) { res.json({ approval: await getApprovalDetail(req.user, req.validatedParams.approvalId) }); }
export async function approve(req, res) { res.json({ approval: await approveRequest(req.user, req.validatedParams.approvalId, req.validatedBody.comment) }); }
export async function reject(req, res) { res.json({ approval: await rejectRequest(req.user, req.validatedParams.approvalId, req.validatedBody.comment) }); }
