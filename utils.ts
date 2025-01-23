import util from "node:util";
import { type Token, TokenType } from "./front-end/lexer";

export function log(obj: unknown) {
  console.log(util.inspect(obj, { depth: null, colors: true, compact: true }));
}

export function logNameOfToken(token: TokenType): string {
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
