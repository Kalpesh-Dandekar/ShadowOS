import { listOwnedAudit } from "../services/audit/auditService.js";
export async function getRequestAudit(req,res){res.json({events:await listOwnedAudit(req.user.id,req.validatedParams.id)});}
