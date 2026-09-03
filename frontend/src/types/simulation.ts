import type { PlanActionType, PlanResourceType, PlanTarget } from "./plan";

export type SimulationProvider = "SYNTHETIC";
export type SimulationStatus = "COMPLETED" | "FAILED";
export type SimulationEffectType = Extract<PlanActionType, "ARCHIVE_RESOURCE" | "DELETE_RESOURCE">;

export type SimulationEffect = {
  id: string;
  planActionId: string;
  resourceKey: string;
  resourceType: PlanResourceType;
  effectType: SimulationEffectType;
  beforeState: PlanTarget;
  afterState: PlanTarget;
  changed: boolean;
  createdAt: string;
};

export type SimulationRun = {
  id: string;
  planId: string;
  provider: SimulationProvider;
  status: SimulationStatus;
  totalResourcesExamined: number;
  matchedResources: number;
  affectedResources: number;
  dependencyObservations: number;
  summary: string;
  effects: SimulationEffect[];
  createdAt: string;
  updatedAt: string;
};
