// environment.ts | Responsible for managing the variables in the runtime

import {
  makeNumberValue,
  makeNullValue,
  makeBooleanValue,
  makeNativeFunctionValue,
} from "./values";
import { throwAnError } from "../utils/errors";
import { javascriptObjectToCrustObject } from "../utils/javascript";
import { runtimeValueToString } from "../utils/runtime";

import type { RuntimeValue } from "./values";

// Sets up the global scope
function setupGlobalScope(environment: Environment) {
  const testMap = new Map();
  testMap.set("x", makeNumberValue(100));
  testMap.set("y", makeNumberValue(200));
  // Global variables
  environment.declareVariable("true", makeBooleanValue(true), true);
  environment.declareVariable("false", makeBooleanValue(false), true);
  environment.declareVariable("null", makeNullValue(), true);

  // Global bulit-in objects
  environment.declareVariable(
    "Math",
    javascriptObjectToCrustObject({
      PI: Math.PI,
      E: Math.E,
      abs: Math.abs,
      acos: Math.acos,
      acosh: Math.acosh,
      asin: Math.asin,
      asinh: Math.asinh,
      atan: Math.atan,
      atanh: Math.atanh,
      atan2: Math.atan2,
      cbrt: Math.cbrt,
      ceil: Math.ceil,
      clz32: Math.clz32,
      cos: Math.cos,
      cosh: Math.cosh,
      exp: Math.exp,
      expm1: Math.expm1,
      floor: Math.floor,
      fround: Math.fround,
      hypot: Math.hypot,
      imul: Math.imul,
      log: Math.log,
      log1p: Math.log1p,
      log10: Math.log10,
      log2: Math.log2,
      max: Math.max,
      min: Math.min,
      pow: Math.pow,
      random: Math.random,
      round: Math.round,
      sign: Math.sign,
      sin: Math.sin,
      sinh: Math.sinh,
      sqrt: Math.sqrt,
      tan: Math.tan,
      tanh: Math.tanh,
      trunc: Math.trunc,
    }),
    true
  );

  // Global bulit-in functions
  environment.declareVariable(
    "debug",
    makeNativeFunctionValue((args) => {
      console.log(...args);
      return makeNullValue();
    }),
    true
  );
  environment.declareVariable(
    "typeof",
    makeNativeFunctionValue((args) => {
      console.log(...args.map((arg) => arg.type));
      return makeNullValue();
    }),
    true
  );
  environment.declareVariable(
    "output",
    makeNativeFunctionValue((args) => {
      console.log(...args.map((arg) => runtimeValueToString(arg)));
      return makeNullValue();
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
