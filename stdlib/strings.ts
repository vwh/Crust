// stdlib/strings.ts | Standard library strings

import { makeNativeFunctionValue, makeStringValue } from "../runtime/values";

import type {
  ArrayValue,
  BooleanValue,
  ErrorValue,
  NumberValue,
  ObjectValue,
} from "../runtime/values";

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

export default {
  string,
};
