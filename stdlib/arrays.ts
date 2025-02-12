// stdlib/arrays.ts | Standard library for arrays

import { makeNativeFunctionValue, makeNullValue } from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type { ArrayValue } from "../runtime/values";

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
  append,
};
