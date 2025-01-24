export type ValueType = "null" | "number" | "boolean";

//*

export interface RuntimeValue {
  type: ValueType;
}

export interface NullValue extends RuntimeValue {
  type: "null";
  value: null;
}

export interface NumberValue extends RuntimeValue {
  type: "number";
  value: number;
}

export interface BooleanValue extends RuntimeValue {
  type: "boolean";
  value: boolean;
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
