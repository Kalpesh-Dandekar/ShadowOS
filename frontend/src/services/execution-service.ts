import{apiRequest}from"./api-client";import type{AuditEvent,ExecutionRun,RollbackRun}from"../types/execution";
export const executeRequest=(requestId:string)=>apiRequest<{execution:ExecutionRun}>(`/api/requests/${encodeURIComponent(requestId)}/execution`,{method:"POST"}).then(x=>x.execution);
export const getRequestExecution=(requestId:string)=>apiRequest<{execution:ExecutionRun}>(`/api/requests/${encodeURIComponent(requestId)}/execution`).then(x=>x.execution);
export const rollbackExecution=(executionId:string)=>apiRequest<{rollback:RollbackRun}>(`/api/executions/${encodeURIComponent(executionId)}/rollback`,{method:"POST"}).then(x=>x.rollback);
export const getRequestAudit=(requestId:string)=>apiRequest<{events:AuditEvent[]}>(`/api/requests/${encodeURIComponent(requestId)}/audit`).then(x=>x.events);
