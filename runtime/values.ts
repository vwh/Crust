// values.ts | The values in the runtime

export type ValueType = "null" | "number" | "boolean" | "object";

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
