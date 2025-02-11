// utils/javascript.ts | Converts javascript stuff to crust runtime stuff

import {
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
  makeStringValue,
  makeNativeFunctionValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type {
  RuntimeValue,
  StringValue,
  NumberValue,
  BooleanValue,
  ObjectValue,
} from "../runtime/values";

// Converts a javascript value to a runtime value
export function javascriptValueToCrustValue(value: unknown): RuntimeValue {
  if (value === null) return makeNullValue();
  if (typeof value === "boolean") return makeBooleanValue(value);
  if (typeof value === "number") return makeNumberValue(value);
  if (typeof value === "string") return makeStringValue(value);
  if (typeof value === "function")
    return javascriptFunctionToCrustFunction(
      value as (...args: unknown[]) => unknown
    );

  if (Array.isArray(value)) {
    const array = value.map((item) => javascriptValueToCrustValue(item));

    return {
      type: "object",
      properties: new Map(array.map((item, index) => [index.toString(), item])),
    } as ObjectValue;
  }

  if (typeof value === "object" && value !== null) {
    return javascriptObjectToCrustObject(value as Record<string, unknown>);
  }

  throwAnError(
    "RuntimeError",
    `at the javascript value [ ${value} ]: \n Javascript value cannot be converted to a runtime value`
  );
}

// Converts a javascript function to a crust function
export function javascriptFunctionToCrustFunction(
  value: (...args: unknown[]) => unknown
) {
  return makeNativeFunctionValue((args) => {
    // Convert javascript function arguments to runtime values
    const jsArgs = args.map((arg) => {
      if (arg.type === "number") return (arg as NumberValue).value;
      if (arg.type === "string") return (arg as StringValue).value;
      if (arg.type === "boolean") return (arg as BooleanValue).value;
      if (arg.type === "object") return (arg as ObjectValue).properties;
      return null;
    });

    const result = value(...jsArgs);
    return javascriptValueToCrustValue(result);
  });
}

// Converts a javascript object to a crust object
export function javascriptObjectToCrustObject(obj: Record<string, unknown>) {
  const crustObj = new Map();
  for (const [key, value] of Object.entries(obj)) {
    crustObj.set(key, javascriptValueToCrustValue(value));
  }

  return {
    type: "object",
    properties: crustObj,
  } as ObjectValue;
}
