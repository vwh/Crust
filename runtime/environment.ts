// environment.ts | Responsible for managing the variables in the runtime

import { makeNullValue, makeBooleanValue, makeNumberValue } from "./values";
import { throwAnError } from "../utils/errors";

// Standard library imports
import stdlibLog from "../stdlib/logging";
import stdlibFunctions from "../stdlib/functions";
import stdlibStrings from "../stdlib/strings";
import stdlibNumbers from "../stdlib/numbers";
import stdlibArrays from "../stdlib/arrays";
import stdlibJSObjects from "../stdlib/js-objects";

import type { RuntimeValue } from "./values";

// Sets up the global scope
function setupGlobalScope(environment: Environment) {
  // Global variables
  environment.declareVariable("true", makeBooleanValue(true), true);
  environment.declareVariable("false", makeBooleanValue(false), true);
  environment.declareVariable("null", makeNullValue(), true);
  environment.declareVariable(
    "MAX_SAFE_INTEGER",
    makeNumberValue(Number.MAX_SAFE_INTEGER),
    true
  );
  environment.declareVariable(
    "MIN_SAFE_INTEGER",
    makeNumberValue(Number.MIN_SAFE_INTEGER),
    true
  );

  // Add all global built-in functions/objects/values in the global scope
  for (const [key, value] of Object.entries({
    ...stdlibLog,
    ...stdlibFunctions,
    ...stdlibStrings,
    ...stdlibNumbers,
    ...stdlibArrays,
    ...stdlibJSObjects,
  })) {
    environment.declareVariable(key, value as RuntimeValue, true);
  }
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
      throwAnError(
        "RuntimeError",
        `The variable [ ${name} ] cannot redeclare variable its already declared`
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
      throwAnError(
        "RuntimeError",
        `Cannot reassign constant [ ${name} ] variable`
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
      throwAnError("RuntimeError", `The variable [ ${name} ] is not declared`);
    }

    return this.parent.resolveVariable(name);
  }
}
