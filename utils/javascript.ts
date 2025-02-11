// utils/javascript.ts | Converts javascript stuff to crust runtime stuff

import {
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
  makeStringValue,
  makeNativeFunctionValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type {
  RuntimeValue,
  StringValue,
  NumberValue,
  BooleanValue,
  ObjectValue,
  NativeFunctionValue,
} from "../runtime/values";

// Converts a javascript value to a runtime value
export function javascriptValueToCrustValue(value: unknown): RuntimeValue {
  // throw and error when NaN or Symbol or BigInt
  if (typeof value === "symbol")
    throwAnError(
      "TypeError",
      "JavaScript function passes (Symbol) to Crust, which is not supported"
    );
  if (typeof value === "bigint")
    throwAnError(
      "TypeError",
      "JavaScript function passes (BigInt) to Crust, which is not supported"
    );
  if (Number.isNaN(value))
    throwAnError(
      "TypeError",
      "JavaScript function passes (NaN) to Crust, which is not supported"
    );

  if (value === null || value === undefined) return makeNullValue();
  if (typeof value === "boolean") return makeBooleanValue(value);
  if (typeof value === "number") return makeNumberValue(value);
  if (typeof value === "string") return makeStringValue(value);
  if (typeof value === "function")
    return javascriptFunctionToCrustFunction(
      value as (...args: unknown[]) => unknown
    );

  // TODO: Handle arrays when they are implemented
  if (Array.isArray(value)) {
    const array = value.map((item) => javascriptValueToCrustValue(item));

    return {
      type: "object",
      properties: new Map(array.map((item, index) => [index.toString(), item])),
    } as ObjectValue;
  }

  if (typeof value === "object") {
    return javascriptObjectToCrustObject(value as Record<string, unknown>);
  }

  throwAnError(
    "RuntimeError",
    `The JavaScript value [ ${value} ] cannot be converted to a Crust value`
  );
}

// Converts a javascript object to a crust object
function javascriptObjectToCrustObject(obj: Record<string, unknown>) {
  const crustObj = new Map();
  for (const [key, value] of Object.entries(obj)) {
    crustObj.set(key, javascriptValueToCrustValue(value));
  }

  return {
    type: "object",
    properties: crustObj,
  } as ObjectValue;
}

// Converts a javascript function to a crust function
function javascriptFunctionToCrustFunction(
  value: (...args: unknown[]) => unknown
) {
  return makeNativeFunctionValue((args) => {
    // Convert runtime values to javascript values
    const jsArgs = args.map((arg) => {
      switch (arg.type) {
        case "number":
          return (arg as NumberValue).value;
        case "string":
          return (arg as StringValue).value;
        case "boolean":
          return (arg as BooleanValue).value;
        case "object": {
          // Convert Map back to regular object
          const obj: Record<string, unknown> = {};
          (arg as ObjectValue).properties.forEach((value, key) => {
            obj[key] = crustValueToJavascriptValue(value);
          });
          return obj;
        }
        case "null":
          return null;
        case "function":
          return (...innerArgs: unknown[]) => {
            const crustArgs = innerArgs.map(javascriptValueToCrustValue);
            return crustValueToJavascriptValue(
              // @ts-expect-error - We don't wan't to pass the environment to the function
              (arg as NativeFunctionValue).call(crustArgs)
            );
          };
        default:
          return null;
      }
    });

    try {
      const result = value(...jsArgs);
      return javascriptValueToCrustValue(result);
    } catch {
      throwAnError("RuntimeError", "JavaScript function throws an error");
    }
  });
}

// Helper function to convert Crust values back to JavaScript values
function crustValueToJavascriptValue(value: RuntimeValue): unknown {
  switch (value.type) {
    case "number":
      return (value as NumberValue).value;
    case "string":
      return (value as StringValue).value;
    case "boolean":
      return (value as BooleanValue).value;
    case "object": {
      const obj: Record<string, unknown> = {};
      (value as ObjectValue).properties.forEach((val, key) => {
        obj[key] = crustValueToJavascriptValue(val);
      });
      return obj;
    }
    case "native-function":
    case "function":
      return (...args: unknown[]) => {
        const crustArgs = args.map(javascriptValueToCrustValue);
        // @ts-expect-error - We don't wan't to pass the environment to the function
        return crustValueToJavascriptValue(value.call(crustArgs));
      };
    case "null":
      return null;
    default:
      return null;
  }
}
