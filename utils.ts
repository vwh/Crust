import util from "node:util";
import { TokenType } from "./front-end/lexer";

// Logs the given object to the console
export function log(obj: unknown) {
  console.log(util.inspect(obj, { depth: null, colors: true, compact: true }));
}

// Gets the name of the given token from the TokenType enum
export function getNameOfToken(token: TokenType): string {
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
  }
}

export function throwAnError(type: ErrorType, message: string): never {
  console.error(`${type} thrown ${message}`);
  process.exit(1);
}

type ErrorType = "ParseError" | "LexerError" | "RuntimeError";
