// values.ts | The values in the runtime

import type { Statement } from "../front-end/ast";
import type Environment from "./environment";

// Represents the type of a value in the runtime
type ValueType =
  | "null"
  | "number"
  | "boolean"
  | "object"
  | "array"
  | "native-function"
  | "function"
  | "return"
  | "string"
  | "error";

/**
 * Represents a value in the runtime
 */
export interface RuntimeValue {
  type: ValueType;
}

/**
 * Represents a null value in the runtime
 */
export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

/**
 * Represents a number value in the runtime
 */
export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

/**
 * Represents a boolean value in the runtime
 */
export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
}

/**
 * Represents an object value in the runtime
 */
export interface ObjectValue extends RuntimeValue {
  type: "object";
  properties: Map<string, RuntimeValue>;
}

/**
 * Represents an array value in the runtime
 */
export interface ArrayValue extends RuntimeValue {
  type: "array";
  elements: RuntimeValue[];
}

/**
 * Represents a string value in the runtime
 */
export interface StringValue extends RuntimeValue {
  type: "string";
  value: string;
}

/**
 * Represents a return value in the runtime
 */
export interface ReturnValue extends RuntimeValue {
  type: "return";
  value: RuntimeValue;
}

export type ErrorType =
  | "ParseError"
  | "LexerError"
  | "RuntimeError"
  | "TypeError"
  | "DivisionByZeroError"
  | "IndexOutOfBoundsError";

/**
 * Represents an error value in the runtime
 */
export interface ErrorValue extends RuntimeValue {
  type: "error";
  value: ErrorType;
  error: Error;
}

// Creates a new NumberValue
export function makeNumberValue(value: number): NumberValue {
  return {
    type: "number",
    value,
  } as NumberValue;
}

// Creates a new NullValue
export function makeNullValue(): NullValue {
  return {
    type: "null",
    value: null,
  } as NullValue;
}

// Creates a new BooleanValue
export function makeBooleanValue(value: boolean): BooleanValue {
  return {
    type: "boolean",
    value,
  } as BooleanValue;
}

// Creates a new StringValue
export function makeStringValue(value: string): StringValue {
  return {
    type: "string",
    value,
  } as StringValue;
}

// Creates a new ErrorValue
export function makeErrorValue(type: ErrorType, error: Error): ErrorValue {
  return {
    type: "error",
    value: type,
    error,
  } as ErrorValue;
}

// Creates a new ArrayValue
export function makeArrayValue(elements: RuntimeValue[]): ArrayValue {
  return {
    type: "array",
    elements,
  } as ArrayValue;
}

// Creates a new ReturnValue
export function makeReturnValue(value: RuntimeValue): ReturnValue {
  return {
    type: "return",
    value,
  } as ReturnValue;
}

type FunctionCall = (args: RuntimeValue[], env: Environment) => RuntimeValue;

/**
 * Represents a native function value in the runtime
 */
export interface NativeFunctionValue extends RuntimeValue {
  type: "native-function";
  call: FunctionCall;
}

// Creates a new NativeFunctionValue
export function makeNativeFunctionValue(
  call: FunctionCall
): NativeFunctionValue {
  return {
    type: "native-function",
    call,
  } as NativeFunctionValue;
}

/**
 * Represents a user-defined function value in the runtime
 */
export interface FunctionValue extends RuntimeValue {
  type: "function";
  name: string;
  parameters: string[];
  environment: Environment;
  body: Statement[];
}
