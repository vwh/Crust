// stdlib/functions.ts | Standard library functions

import {
  makeNativeFunctionValue,
  makeNullValue,
  makeNumberValue,
  makeStringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type {
  ArrayValue,
  BooleanValue,
  ErrorValue,
  NumberValue,
  ObjectValue,
  StringValue,
} from "../runtime/values";

// Global functions
const typeofFN = makeNativeFunctionValue((args) => {
  const value = args[0];
  return makeStringValue(value.type);
});
const input = makeNativeFunctionValue((args) => {
  if (args.length === 0) {
    const result = prompt("");
    return makeStringValue(result || "");
  }

  const arg = args[0] as StringValue;
  if (arg.type !== "string")
    throwAnError("TypeError", `Expected a string, got ${arg.type}`);

  const result = prompt(arg.value);
  return makeStringValue(result || "");
});
const len = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  const arg = args[0];

  if (arg.type === "string")
    return makeNumberValue((arg as StringValue).value.length);
  if (arg.type === "array")
    return makeNumberValue((arg as ArrayValue).elements.length);
  if (arg.type === "object")
    return makeNumberValue(Object.keys((arg as ObjectValue).properties).length);
  if (arg.type === "error")
    return makeNumberValue((arg as ErrorValue).error.name.length);

  return makeNumberValue(0);
});

// Number methods
const float = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  const arg = args[0] as StringValue;

  if (arg.type !== "string")
    throwAnError("TypeError", `Expected a string, got ${arg.type}`);

  const result = Number.parseFloat(arg.value);
  if (Number.isNaN(result))
    throwAnError("TypeError", `Unable to parse ${arg.value} as an integer`);

  return makeNumberValue(result);
});
const int = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  const arg = args[0] as StringValue;

  if (arg.type !== "string")
    throwAnError("TypeError", `Expected a string, got ${args[0].type}`);
  if (Number.isNaN(Number.parseFloat(arg.value)))
    throwAnError("TypeError", `Unable to parse ${arg.value} as a float`);

  return makeNumberValue(Number.parseFloat(arg.value));
});

// String methods
const string = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeStringValue("");
  const arg = args[0];

  if (arg.type === "string") return arg;
  if (arg.type === "number")
    return makeStringValue((arg as NumberValue).value.toString());
  if (arg.type === "boolean")
    return makeStringValue((arg as BooleanValue).value.toString());
  if (arg.type === "null") return makeStringValue("null");
  if (arg.type === "object")
    return makeStringValue(
      JSON.stringify(
        Object.fromEntries((arg as ObjectValue).properties),
        null,
        2
      )
    );
  if (arg.type === "array")
    return makeStringValue(
      JSON.stringify((arg as ArrayValue).elements, null, 2)
    );
  if (arg.type === "error") return makeStringValue((arg as ErrorValue).value);

  return makeStringValue("");
});

// Array methods
const append = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;
  for (let i = 1; i < args.length; i++) {
    array.elements.push(args[i]);
  }

  return makeNullValue();
});

export default {
  typeof: typeofFN,
  parseInt: int,
  parseFloat: float,
  input,
  string,
  len,
  append,
};
