import { AppError } from "../../utils/appError.js";
import { PlannerProvider } from "./plannerProvider.js";

function normalized(prompt) {
  return prompt.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").replace(/\s+/g, " ").trim();
}

function action(position, type, resourceType, description, target, destructive, reversible, reason) {
  return { position, type, resourceType, description, target, destructive, reversible, estimatedScope: null, reason };
}

function scopeActions(resourceType, subject, target) {
  return [
    action(1, "QUERY_RESOURCE", resourceType, `Locate ${subject}`, target, false, true, "Identify only resources matching the requested scope"),
    action(2, "VALIDATE_SCOPE", resourceType, `Validate ${subject} and dependency constraints`, target, false, true, "Prevent the proposed mutation from exceeding the intended scope"),
  ];
}

function invoiceAgeTarget(prompt) {
  const months = { january: "01", february: "02", march: "03", april: "04", may: "05", june: "06", july: "07", august: "08", september: "09", october: "10", november: "11", december: "12" };
  const match = prompt.match(/older than\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
  return { status: "archived", ...(match ? { before: `${match[2]}-${months[match[1].toLowerCase()]}-01` } : { ageRule: "older_than_requested_threshold" }) };
}

function inactiveAccountTarget(prompt) {
  if (/\ball\s+inactive\s+customer\s+accounts?\b/i.test(prompt)) return { status: "inactive", selection: "all_inactive" };
  const match = prompt.match(/older than\s+(\d+)\s+years?/i);
  return { status: "inactive", ...(match ? { olderThanYears: Number(match[1]) } : { ageRule: "older_than_requested_threshold" }) };
}

export class SimulationPlannerProvider extends PlannerProvider {
  constructor() { super("SIMULATION"); }

  generatePlan(request) {
    const prompt = normalized(request.prompt);
    const invoice = /\binvoices?\b/.test(prompt);
    const customerAccount = /\bcustomer\s+accounts?\b/.test(prompt);
    const userAccount = /\buser\s+accounts?\b/.test(prompt);

    if (/\bdelete\b/.test(prompt) && invoice && /\barchived?\b/.test(prompt)) {
      const target = invoiceAgeTarget(request.prompt);
      return {
        summary: "Identify and validate archived invoices before proposing irreversible deletion.",
        actions: [...scopeActions("INVOICE", "archived invoices within the requested age threshold", target),
          action(3, "DELETE_RESOURCE", "INVOICE", "Delete validated archived invoice records", target, true, false, "Fulfill the requested deletion only after scope validation")],
      };
    }

    if (/\barchive\b/.test(prompt) && customerAccount && /\binactive\b/.test(prompt)) {
      const target = inactiveAccountTarget(request.prompt);
      return {
        summary: "Identify and validate inactive customer accounts before proposing reversible archival.",
        actions: [...scopeActions("CUSTOMER_ACCOUNT", "inactive customer accounts within the requested age threshold", target),
          action(3, "ARCHIVE_RESOURCE", "CUSTOMER_ACCOUNT", "Archive validated inactive customer accounts", target, false, true, "Remove inactive accounts from active use without deleting them")],
      };
    }

    const resourceType = userAccount ? "USER_ACCOUNT" : customerAccount ? "CUSTOMER_ACCOUNT" : invoice ? "INVOICE" : null;
    if (resourceType && /\b(search|query|find|locate)\b/.test(prompt)) {
      return { summary: "Locate resources matching the governed request.", actions: [action(1, "QUERY_RESOURCE", resourceType, "Locate resources matching the request", { selection: "governed_request_scope" }, false, true, "Return a constrained resource selection without mutation")] };
    }
    if (resourceType && /\b(update|change|disable|enable)\b/.test(prompt)) {
      const target = { stateChange: "requested_account_state" };
      return { summary: "Locate, validate, and propose an account state update.", actions: [...scopeActions(resourceType, "accounts matching the requested state change", target), action(3, "UPDATE_RESOURCE", resourceType, "Update validated account state", target, false, true, "Apply the explicitly requested state change") ] };
    }
    if (resourceType && /\b(create|add)\b/.test(prompt)) {
      const target = { definition: "validated_request_fields" };
      return { summary: "Validate and propose creation of the requested resource.", actions: [action(1, "VALIDATE_SCOPE", resourceType, "Validate resource creation inputs", target, false, true, "Ensure the requested resource is sufficiently constrained"), action(2, "CREATE_RESOURCE", resourceType, "Create the validated resource", target, false, true, "Fulfill the governed creation request")] };
    }

    throw new AppError(422, "UNSUPPORTED_PLANNING_INTENT", "Planning unavailable for this request");
  }
}

export const simulationPlannerProvider = new SimulationPlannerProvider();
