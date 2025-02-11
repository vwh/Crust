// stdlib/functions.ts | Standard library functions

import { makeNativeFunctionValue, makeStringValue } from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type { StringValue } from "../runtime/values";
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
    return throwAnError("TypeError", "input: expected a string");

  const result = prompt((args[0] as StringValue).value);
  return makeStringValue(result || "");
});

// Number methods
const parseIntFN = javascriptValueToCrustValue(Number.parseInt);
const parseFloatFN = javascriptValueToCrustValue(Number.parseFloat);

export default {
  typeof: typeofFN,
  parseInt: parseIntFN,
  parseFloat: parseFloatFN,
  input,
};
