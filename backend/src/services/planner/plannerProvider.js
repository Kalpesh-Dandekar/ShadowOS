export class PlannerProvider {
  constructor(type) {
    if (new.target === PlannerProvider) throw new TypeError("PlannerProvider is abstract");
    this.type = type;
  }

  generatePlan() {
    throw new TypeError("PlannerProvider.generatePlan must be implemented");
  }
}
