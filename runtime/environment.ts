import type { RuntimeValue } from "./values";

export default class Environment {
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;

  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
  }

  public declareVariable(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      console.error(
        `Cannot redeclare variable ${name}, it is already declared`
      );
      process.exit(1);
    }

    this.variables.set(name, value);

    return value;
  }

  public getVariable(name: string): RuntimeValue {
    const environment = this.resolveVariable(name);
    return environment.variables.get(name) as RuntimeValue;
  }

  public assignVariable(name: string, value: RuntimeValue): RuntimeValue {
    const environment = this.resolveVariable(name);
    environment.variables.set(name, value);

    return value;
  }

  public resolveVariable(name: string): Environment {
    if (this.variables.has(name)) {
      return this;
    }

    if (this.parent === undefined) {
      throw new Error(`Variable ${name} is not declared`);
    }

    return this.parent.resolveVariable(name);
  }
}
