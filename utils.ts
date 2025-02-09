import util from "node:util";
import { TokenType } from "./front-end/lexer";

import type {
  FunctionValue,
  RuntimeValue,
  StringValue,
  NumberValue,
  BooleanValue,
  ObjectValue,
} from "./runtime/values";

// Logs the given object to the console
export function log(obj: unknown) {
  console.log(util.inspect(obj, { depth: null, colors: true, compact: true }));
}

// Gets the name of the given token from the TokenType enum
export function getNameOfToken(token: TokenType) {
  switch (token) {
    case TokenType.Let:
      return "Let";
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

type ErrorType = "ParseError" | "LexerError" | "RuntimeError";
