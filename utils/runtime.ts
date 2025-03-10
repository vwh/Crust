// utils/runtime.ts | Converts runtime stuff to javascript stuff

import type {
  RuntimeValue,
  StringValue,
  NumberValue,
  BooleanValue,
  ObjectValue,
  FunctionValue,
  ErrorValue,
  ArrayValue,
} from "../runtime/values";

// Converts the given runtime value to a javascript string
// Used on global output() function
export function runtimeValueToString(valueObject: RuntimeValue): string {
  if (!valueObject) return "null";
  if (valueObject.type === "null") return "null";

  if (valueObject.type === "string") return (valueObject as StringValue).value;

  if (valueObject.type === "number")
    return (valueObject as NumberValue).value.toString();

  if (valueObject.type === "boolean")
    return (valueObject as BooleanValue).value.toString();

  if (valueObject.type === "function")
    return `function<${(valueObject as FunctionValue).name}>`;

  if (valueObject.type === "native-function") return "native-function";

  if (valueObject.type === "object")
    return `object<${JSON.stringify(
      Object.fromEntries((valueObject as ObjectValue).properties),
      null,
      2
    )}>`;

  if (valueObject.type === "array")
    return `array<${(valueObject as ArrayValue).elements
      .map(runtimeValueToString)
      .join(", ")}>`;

  if (valueObject.type === "error")
    return `error(${(valueObject as ErrorValue).value})<${
      (valueObject as ErrorValue).error.message
    }>`;

  return "unknown";
}
