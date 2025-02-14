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
  type: ErrorType;
  constructor(type: ErrorType, message: string) {
    super(`${type}: ${message}`);
    this.type = type;
    // Capture the stack trace, omitting this constructor from it.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CrustError);
    }
    // Clean the stack trace.
    this.stack = this.cleanStack(this.stack);
  }

  private cleanStack(stack?: string): string {
    if (!stack) return "";
    // Split into lines and filter out internal frames.
    // Adjust the filter below to remove lines you don't want to show.
    return stack
      .split("\n")
      .filter(
        (line) =>
          !line.includes("/crust/") && // remove internal Crust runtime files
          !line.includes("node:") // optionally remove Node internals
      )
      .join("\n");
  }
}

export function throwAnError(type: ErrorType, message: string): never {
  throw new CrustError(type, message);
}

Error.prepareStackTrace = (err, structuredStackTrace) => {
  return structuredStackTrace
    .filter((callSite) => {
      // Remove call sites that match unwanted patterns.
      const fileName = callSite.getFileName() || "";
      return !fileName.includes("/crust/") && !fileName.startsWith("node:");
    })
    .map((callSite) => {
      // Customize how each frame is printed.
      const fnName = callSite.getFunctionName() || "<anonymous>";
      const fileName = callSite.getFileName() || "";
      const lineNumber = callSite.getLineNumber();
      const columnNumber = callSite.getColumnNumber();
      return `${fnName} at ${fileName}:${lineNumber}:${columnNumber}`;
    })
    .join("\n");
};
