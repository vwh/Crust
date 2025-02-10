// lexer.ts | Responsible for producing tokens from the source code

import { throwAnError } from "../utils/errors";

// Represents the type of a token our lexer produces
export enum TokenType {
  // Literals
  Number, // e.g. 123
  Identifier, // e.g. foo
  String, // e.g. "Hello World"

  // Keywords
  Set, // Mutable variable declaration
  Keep, // Constant variable declaration
  Fn, // Function
  If,
  Else,
  Elif, // else if
  While,
  Break,
  Continue,

  // Operators and punctuation
  BinaryOperator, // +, -, *, /, %,
  ComparisonOperator, // ==, !=, <, >, <=, >=
  LogicalOperator, // &&, ||
  UnaryOperator, // +, -, !
  Equals, // =
  Comma, // ,
  Colon, // :
  OpenParen, // (
  CloseParen, // )
  OpenBrace, // {
  CloseBrace, // }
  OpenBracket, // [
  CloseBracket, // ]
  Semicolon, // ;
  Dot, // .
  Power, // **

  EOF, // End of File
}

// Keywords lookup
const KEYWORDS: Record<string, TokenType> = {
  set: TokenType.Set,
  keep: TokenType.Keep,
  fn: TokenType.Fn,
  if: TokenType.If,
  else: TokenType.Else,
  elif: TokenType.Elif,
  while: TokenType.While,
  break: TokenType.Break,
  continue: TokenType.Continue,
};

// Represents a single token from the source code
export interface Token {
  type: TokenType;
  value: string;
}

// Creates a new token from a given type and value
function token(type: TokenType, value: string): Token {
  return { type, value };
}

// The main tokenizer function
export function tokenizer(sourceCode: string): Token[] {
  const tokens: Token[] = [];
  const src = sourceCode.split("");

  while (src.length > 0) {
    const char = src.shift() as string;

    // Skip whitespace characters
    if (isSkippable(char)) continue;

    // Handle single-character tokens (parentheses, braces, punctuation, etc.)
    if (isSingleCharToken(char)) {
      tokens.push(getSingleCharToken(char));
      continue;
    }

    // Handle string literals ("..." or '...')
    if (char === '"' || char === "'") {
      tokens.push(readStringToken(char, src));
      continue;
    }

    // Handle numeric literals (integers for now)
    if (isDigit(char)) {
      tokens.push(readNumberToken(char, src));
      continue;
    }

    // Handle identifiers and keywords
    if (isAlphabet(char)) {
      tokens.push(readIdentifierOrKeywordToken(char, src));
      continue;
    }

    // Handle operators (including deciding on unary vs. binary)
    if (isOperator(char)) {
      tokens.push(readOperatorToken(char, src, tokens));
      continue;
    }

    // Unknown token
    throwAnError("LexerError", `Unexpected character: ${char}`);
  }

  // End-of-file token
  tokens.push(token(TokenType.EOF, "EOF"));
  return tokens;
}

// Checks if the given character is whitespace
function isSkippable(char: string): boolean {
  return (
    char === " " ||
    char === "\n" ||
    char === "\t" ||
    char === "\r" ||
    char === ";"
  );
}

// Determines if the character represents a single-character token
function isSingleCharToken(char: string): boolean {
  return "(){}[]:,;.".includes(char);
}

// Returns the corresponding token for a single-character token
function getSingleCharToken(char: string): Token {
  switch (char) {
    case "(":
      return token(TokenType.OpenParen, char);
    case ")":
      return token(TokenType.CloseParen, char);
    case "{":
      return token(TokenType.OpenBrace, char);
    case "}":
      return token(TokenType.CloseBrace, char);
    case "[":
      return token(TokenType.OpenBracket, char);
    case "]":
      return token(TokenType.CloseBracket, char);
    case ",":
      return token(TokenType.Comma, char);
    case ":":
      return token(TokenType.Colon, char);
    case ";":
      return token(TokenType.Semicolon, char);
    case ".":
      return token(TokenType.Dot, char);
    default:
      throwAnError("LexerError", `Unexpected single-character token: ${char}`);
  }
}

// Reads a string literal token
function readStringToken(quoteType: string, src: string[]): Token {
  let str = "";
  while (src.length > 0 && src[0] !== quoteType) {
    str += src.shift();
  }
  if (src.length === 0)
    throwAnError(
      "LexerError",
      `Unterminated string literal: Missing closing ${quoteType}`
    );
  src.shift(); // consume the closing quote
  return token(TokenType.String, str);
}

// Reads a numeric literal token (only integers are handled here)
function readNumberToken(initial: string, src: string[]): Token {
  let num = initial;
  while (src.length > 0 && isDigit(src[0])) {
    num += src.shift();
  }
  return token(TokenType.Number, num);
}

// Reads an identifier or a keyword token
function readIdentifierOrKeywordToken(initial: string, src: string[]): Token {
  let id = initial;
  while (src.length > 0 && isIdentifierChar(src[0])) {
    id += src.shift();
  }
  // Check if the identifier is a reserved keyword
  if (KEYWORDS[id]) {
    return token(KEYWORDS[id], id);
  }
  return token(TokenType.Identifier, id);
}

// Checks if a character can be part of an identifier (after the first letter)
function isIdentifierChar(char: string): boolean {
  return /^[a-zA-Z0-9_]$/.test(char);
}

// Checks if the given character is an alphabet letter
function isAlphabet(char: string): boolean {
  return /^[a-zA-Z]$/.test(char);
}

// Checks if the given character is a digit
function isDigit(char: string): boolean {
  return /^[0-9]$/.test(char);
}

// Checks if the character is one of the operator characters
function isOperator(char: string): boolean {
  // This list can be extended as needed.
  return "+-*/%!<>=&|^".includes(char);
}

// Reads an operator token and uses context (the tokens array) to decide if it’s unary or binary
function readOperatorToken(
  initial: string,
  src: string[],
  tokens: Token[]
): Token {
  let op = initial;

  // Handle multi-character operators such as:
  //   - Comparison operators: ==, !=, <=, >=
  //   - Power operator: **
  if (src.length > 0) {
    const next = src[0];
    if (
      (initial === "=" ||
        initial === "!" ||
        initial === "<" ||
        initial === ">") &&
      next === "="
    ) {
      op += src.shift();
      return token(TokenType.ComparisonOperator, op);
    }
    // Handle power operator
    if (initial === "*" && next === "*") {
      op += src.shift();
      return token(TokenType.Power, op);
    }
    // Handle logical operators (and, or)
    if (initial === "&" && next === "&") {
      op += src.shift();
      return token(TokenType.LogicalOperator, op);
    }
    if (initial === "|" && next === "|") {
      op += src.shift();
      return token(TokenType.LogicalOperator, op);
    }
  }

  // For '+' , '-' and '!' decide if they are unary or binary
  // (For example, if they appear at the start of an expression or immediately after an operator or an opening parenthesis,
  //  we treat them as unary.)
  if (initial === "+" || initial === "-" || initial === "!") {
    if (shouldTreatAsUnary(tokens)) {
      return token(TokenType.UnaryOperator, op);
    }

    return token(TokenType.BinaryOperator, op);
  }

  // '=' is always the assignment operator
  if (initial === "=") {
    return token(TokenType.Equals, op);
  }

  // For other operators, default to binary or comparison operators
  if (initial === "*" || initial === "/" || initial === "%") {
    return token(TokenType.BinaryOperator, op);
  }
  if (initial === "<" || initial === ">") {
    return token(TokenType.ComparisonOperator, op);
  }

  throwAnError("LexerError", `Unexpected operator: ${initial}`);
}

// Determines (using a simple heuristic) if an operator should be treated as unary.
// If there is no previous token or if the previous token is one that implies an operand is expected next,
// then the current operator (such as '+' or '-') is treated as unary.
function shouldTreatAsUnary(tokens: Token[]): boolean {
  if (tokens.length === 0) return true;
  const prev = tokens[tokens.length - 1];

  // These token types indicate that an operand is expected next.
  switch (prev.type) {
    case TokenType.BinaryOperator:
    case TokenType.ComparisonOperator:
    case TokenType.Equals:
    case TokenType.UnaryOperator:
    case TokenType.OpenParen:
    case TokenType.OpenBrace:
    case TokenType.OpenBracket:
    case TokenType.Comma:
    case TokenType.Colon:
    case TokenType.Semicolon:
      return true;
    default:
      return false;
  }
}
