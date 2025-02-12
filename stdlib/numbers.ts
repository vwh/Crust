// stdlib/numbers.ts | Standard library numbers

import { makeNativeFunctionValue, makeNumberValue } from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type { StringValue } from "../runtime/values";

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

export default {
  float,
  int,
};
