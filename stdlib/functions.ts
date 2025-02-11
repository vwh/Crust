// stdlib/functions.ts | Standard library functions

import {
  makeNativeFunctionValue,
  makeNumberValue,
  makeStringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type { NumberValue, StringValue } from "../runtime/values";
import { javascriptValueToCrustValue } from "../utils/javascript";

const typeofFN = makeNativeFunctionValue((args) => {
  const value = args[0];
  return makeStringValue(value.type);
});

const input = makeNativeFunctionValue((args) => {
  if (args.length === 0) {
    const result = prompt("");
    return makeStringValue(result || "");
  }

  if (args[0].type !== "string")
    throwAnError("TypeError", `Expected a string, got ${args[0].type}`);

  const result = prompt((args[0] as StringValue).value);
  return makeStringValue(result || "");
});

// Number methods
const parseIntFN = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  if (args[0].type !== "string")
    throwAnError("TypeError", `Expected a string, got ${args[0].type}`);

  const string = args[0] as StringValue;
  const radix =
    args[1]?.type === "number" ? (args[1] as NumberValue).value : 10;

  const result = Number.parseInt(string.value, radix);
  if (Number.isNaN(result))
    throwAnError("TypeError", `Unable to parse ${string.value} as an integer`);

  return makeNumberValue(result);
});

const parseFloatFN = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  if (args[0].type !== "string")
    throwAnError("TypeError", `Expected a string, got ${args[0].type}`);

  const string = args[0] as StringValue;
  if (Number.isNaN(Number.parseFloat(string.value)))
    throwAnError("TypeError", `Unable to parse ${string.value} as a float`);

  return makeNumberValue(Number.parseFloat(string.value));
});

// String methods
const string = javascriptValueToCrustValue(
  (value: string | number | boolean | Record<string, unknown> | null) => {
    if (value === null) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "boolean") return value.toString();
    return ""; // TODO: handle Array and other types
  }
);

export default {
  typeof: typeofFN,
  parseInt: parseIntFN,
  parseFloat: parseFloatFN,
  input,
  string,
};
