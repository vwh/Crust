import util from "node:util";
import { TokenType } from "./front-end/lexer";

import {
  type FunctionValue,
  type RuntimeValue,
  type StringValue,
  type NumberValue,
  type BooleanValue,
  type ObjectValue,
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
  makeStringValue,
  makeNativeFunctionValue,
  type NativeFunctionValue,
  type FunctionCall,
  type NullValue,
} from "./runtime/values";

// Logs the given object to the console
export function log(obj: unknown) {
  console.log(util.inspect(obj, { depth: null, colors: true, compact: true }));
}

// Gets the name of the given token from the TokenType enum
export function getNameOfToken(token: TokenType) {
  switch (token) {
    case TokenType.Set:
      return "Set";
    case TokenType.Keep:
      return "Keep";
    case TokenType.Fn:
      return "Fn";
    case TokenType.String:
      return "String";
    case TokenType.CloseBrace:
      return "CloseBrace";
    case TokenType.CloseBracket:
      return "CloseBracket";
    case TokenType.OpenBrace:
      return "OpenBrace";
    case TokenType.OpenBracket:
      return "OpenBracket";
    case TokenType.Semicolon:
      return "Semicolon";
    case TokenType.Comma:
      return "Comma";
    case TokenType.Colon:
      return "Colon";
    case TokenType.Dot:
      return "Dot";
    case TokenType.Number:
      return "Number";
    case TokenType.Identifier:
      return "Identifier";
    case TokenType.Equals:
      return "Equals";
    case TokenType.BinaryOperator:
      return "BinaryOperator";
    case TokenType.OpenParen:
      return "OpenParen";
    case TokenType.CloseParen:
      return "CloseParen";
    case TokenType.EOF:
      return "EOF";
    default:
      return "Unknown Token";
  }
}

export function throwAnError(type: ErrorType, message: string): never {
  console.error(`${type} thrown ${message}`);
  process.exit(1);
}

// Converts the given runtime value to a string
// Used on global output() function
export function runtimeValueToString(valueObject: RuntimeValue) {
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

  return "unknown";
}

// Converts a javascript object to a crust object
export function javascriptObjectToCrustObject(obj: Record<string, unknown>) {
  const crustObj = new Map();
  for (const [key, value] of Object.entries(obj)) {
    crustObj.set(key, javascriptValueToCrustValue(value));
  }
  return {
    type: "object",
    properties: crustObj,
  } as ObjectValue;
}

// Converts a javascript value to a runtime value
export function javascriptValueToCrustValue(value: unknown): RuntimeValue {
  if (value === null) return makeNullValue();
  if (typeof value === "boolean") return makeBooleanValue(value);
  if (typeof value === "number") return makeNumberValue(value);
  if (typeof value === "string") return makeStringValue(value);
  if (typeof value === "function")
    return makeNativeFunctionValue((args) => {
      const jsArgs = args.map((arg) => {
        if (arg.type === "number") return (arg as NumberValue).value;
        if (arg.type === "string") return (arg as StringValue).value;
        if (arg.type === "boolean") return (arg as BooleanValue).value;
        if (arg.type === "object") return (arg as ObjectValue).properties;
        return null;
      });

      const result = value(...jsArgs);
      return makeNumberValue(result);
    });
  if (Array.isArray(value)) {
    const array = value.map((item) => javascriptValueToCrustValue(item));
    return {
      type: "object",
      properties: new Map(array.map((item, index) => [index.toString(), item])),
    } as ObjectValue;
  }

  if (typeof value === "object" && value !== null) {
    return javascriptObjectToCrustObject(value as Record<string, unknown>);
  }

  throwAnError(
    "RuntimeError",
    "Cannot convert javascript value to runtime value"
  );
}

type ErrorType = "ParseError" | "LexerError" | "RuntimeError";
