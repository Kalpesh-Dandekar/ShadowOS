export class SimulationProvider {
  constructor(type) {
    if (new.target === SimulationProvider) throw new TypeError("SimulationProvider is abstract");
    this.type = type;
  }

  simulate() {
    throw new TypeError("SimulationProvider.simulate must be implemented");
  }
}
