// stdlib/functions.ts | Standard library functions

import {
  makeNativeFunctionValue,
  makeNumberValue,
  makeStringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type {
  ArrayValue,
  ErrorValue,
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
    return makeNumberValue((arg as ErrorValue).type.length);

  return makeNumberValue(0);
});

export default {
  typeof: typeofFN,
  input,
  len,
};
