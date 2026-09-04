export class ExecutionProvider {
  constructor(name) { this.name = name; }
  execute() { throw new Error("ExecutionProvider.execute must be implemented"); }
}
