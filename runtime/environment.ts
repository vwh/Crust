import { throwAnError } from "../utils";
import type { RuntimeValue } from "./values";

/**
 * Represents an environment which holds variables.
 */
export default class Environment {
  // The parent is the environment which holds the variable
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;

  constructor(parent?: Environment) {
    this.parent = parent;
    this.variables = new Map();
  }

  // Declares a variable
  public declareVariable(name: string, value: RuntimeValue): RuntimeValue {
    if (this.variables.has(name)) {
      return throwAnError(
        "RuntimeError",
        `at the variable [ ${name} ]: \n Cannot redeclare variable ${name}, it is already declared`
      );
    }

    this.variables.set(name, value);

    return value;
  }

  // Returns the value of the variable
  public getVariable(name: string): RuntimeValue {
    const environment = this.resolveVariable(name);
    return environment.variables.get(name) as RuntimeValue;
  }

  // Assigns the value to the variable
  public assignVariable(name: string, value: RuntimeValue): RuntimeValue {
    const environment = this.resolveVariable(name);
    environment.variables.set(name, value);

    return value;
  }

  // Returns the environment which holds the variable
  public resolveVariable(name: string): Environment {
    if (this.variables.has(name)) {
      return this;
    }

    if (this.parent === undefined) {
      return throwAnError(
        "RuntimeError",
        `at the variable [ ${name} ]: \n Variable ${name} is not declared`
      );
    }

    return this.parent.resolveVariable(name);
  }
}
