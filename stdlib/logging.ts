// stdlib/logging.ts | Standard library logging functions

import { makeNativeFunctionValue, makeNullValue } from "../runtime/values";
import { runtimeValueToString } from "../utils/runtime";

const debug = makeNativeFunctionValue((args) => {
  console.log(...args);
  return makeNullValue();
});

const output = makeNativeFunctionValue((args) => {
  console.log(...args.map((arg) => runtimeValueToString(arg)));
  return makeNullValue();
});

export default {
  debug,
  output,
};
