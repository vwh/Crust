// utils/errors.ts | Responsible for throwing errors and logging stuff

import util from "node:util";
import { TokenType } from "../front-end/lexer";

import type { ErrorType } from "../runtime/values";

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

export class CrustError extends Error {
  constructor(type: ErrorType, message: string) {
    super(`${message}`);
  }
}

export class CrTypeError extends CrustError {
  constructor(message: string) {
    super("TypeError", message);
  }
}

export function throwAnError(type: ErrorType, message: string): never {
  if (type === "TypeError") throw new CrTypeError(message);

  throw new CrustError(type, message);
}
