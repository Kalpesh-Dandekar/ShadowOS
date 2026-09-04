import { executeOwnedRequest, getOwnedExecution, getOwnedRequestExecution } from "../services/execution/executionService.js";
import { getOwnedRollback, rollbackOwnedExecution } from "../services/rollback/rollbackService.js";
export async function execute(req,res){res.status(201).json({execution:await executeOwnedRequest(req.user.id,req.validatedParams.id)});}
export async function getRequestExecution(req,res){res.json({execution:await getOwnedRequestExecution(req.user.id,req.validatedParams.id)});}
export async function getExecution(req,res){res.json({execution:await getOwnedExecution(req.user.id,req.validatedParams.executionId)});}
export async function rollback(req,res){res.status(201).json({rollback:await rollbackOwnedExecution(req.user.id,req.validatedParams.executionId)});}
export async function getRollback(req,res){res.json({rollback:await getOwnedRollback(req.user.id,req.validatedParams.executionId)});}
