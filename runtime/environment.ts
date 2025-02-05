// environment.ts | Responsible for managing the variables in the runtime

import { throwAnError } from "../utils";
import {
  makeNumberValue,
  makeNullValue,
  makeBooleanValue,
  makeNativeFunctionValue,
} from "./values";

import type { RuntimeValue } from "./values";

// Sets up the global scope
function setupGlobalScope(environment: Environment) {
  // Global variables
  environment.declareVariable("test", makeNumberValue(100), true);
  environment.declareVariable("true", makeBooleanValue(true), true);
  environment.declareVariable("false", makeBooleanValue(false), true);
  environment.declareVariable("null", makeNullValue(), true);

  // Global bulit-in functions
  environment.declareVariable(
    "print",
    makeNativeFunctionValue((args) => {
      console.log(...args);
      return makeNullValue();
    }),
    true
  );

  environment.declareVariable(
    "get",
    makeNativeFunctionValue((args) => {
      return args[0];
    }),
    true
  );
}

/**
 * Represents an environment which holds variables.
 */
export default class Environment {
  // The parent is the environment which holds the variable
  private parent?: Environment;
  private variables: Map<string, RuntimeValue>;
  private constants: Set<string>;

  constructor(parent?: Environment) {
    const isGlobal = !parent;

    this.parent = parent;
    this.variables = new Map();
    this.constants = new Set();

    if (isGlobal) setupGlobalScope(this);
  }

  // Declares a variable
  public declareVariable(
    name: string,
    value: RuntimeValue,
    isConstant = false
  ) {
    if (this.variables.has(name)) {
      return throwAnError(
        "RuntimeError",
        `at the variable [ ${name} ]: \n Cannot redeclare variable ${name}, it is already declared`
      );
    }

    this.variables.set(name, value);
    if (isConstant) this.constants.add(name);

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

    if (environment.constants.has(name)) {
      return throwAnError(
        "RuntimeError",
        `at the variable [ ${name} ]: \n Cannot reassign constant variable`
      );
    }

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
