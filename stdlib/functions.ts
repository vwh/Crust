// stdlib/functions.ts | Standard library functions

import {
  makeNativeFunctionValue,
  makeNumberValue,
  makeStringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type { NumberValue, StringValue } from "../runtime/values";

const typeofFN = makeNativeFunctionValue((args) => {
  const value = args[0];
  return makeStringValue(value.type);
});

const parseIntFN = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNumberValue(0);
  if (args[0].type !== "string")
    return throwAnError("TypeError", "parseInt: expected a string");

  const string = args[0] as StringValue;
  const radix =
    args[1]?.type === "number" ? (args[1] as NumberValue).value : 10;
  return makeNumberValue(Number.parseInt(string.value, radix));
});

const input = makeNativeFunctionValue((args) => {
  if (args.length === 0) {
    const result = prompt("");
    return makeStringValue(result || "");
  }

  if (args[0].type !== "string")
    return throwAnError("TypeError", "input: expected a string");

  const result = prompt((args[0] as StringValue).value);
  return makeStringValue(result || "");
});

export default {
  typeof: typeofFN,
  parseInt: parseIntFN,
  input,
};
