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
    return makeNativeFunctionValue((args) => {
      // convert javascript function arguments to runtime values
      const jsArgs = args.map((arg) => {
        if (arg.type === "number") return (arg as NumberValue).value;
        if (arg.type === "string") return (arg as StringValue).value;
        if (arg.type === "boolean") return (arg as BooleanValue).value;
        if (arg.type === "object") return (arg as ObjectValue).properties;
        return null;
      });

      const result = value(...jsArgs);
      return makeNumberValue(result);
    });

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

export const mathObject = javascriptObjectToCrustObject({
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
});

export const dateObject = javascriptObjectToCrustObject({
  now: Date.now,
  parse: Date.parse,
  UTC: Date.UTC,
});

export const jsonObject = javascriptObjectToCrustObject({
  parse: JSON.parse,
  stringify: JSON.stringify,
});
