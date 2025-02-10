// lexer.ts | Responsible for producing tokens from the source code

import { throwAnError } from "../utils/errors";

// Represents the type of a token our lexer produces
export enum TokenType {
  // Literal
  Number, // 123
  Identifier, // foo
  String, // "Hello World"

  // Keywords
  Set, // Mutable variable declaration
  Keep, // Constant variable declaration
  Fn, // Function
  If,
  Else,
  Elif, // else if

  // Operators
  BinaryOperator, // +, -, *, /, %
  ComparisonOperator, // ==, !=, <, >, <=, >=
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

// Represents a single token from the source code
export interface Token {
  type: TokenType;
  value: string;
}

// Keywords, Constant lookup for keywords and known identifiers and symbols
const KEYWORDS: Record<string, TokenType> = {
  set: TokenType.Set,
  keep: TokenType.Keep,
  fn: TokenType.Fn,
  if: TokenType.If,
  else: TokenType.Else,
  elif: TokenType.Elif,
};

// Creates a new token from a given type and value
function token(type: TokenType, value: string): Token {
  return { type, value };
}

// Tokenizes the source code and produces tokens
export function tokenizer(soruceCode: string): Token[] {
  const tokens: Token[] = [];
  const src = soruceCode.split("");

  // Process the source code until we reach the end (EOF)
  while (src.length > 0) {
    const char = src.shift() as string;

    // Start parsing one character tokens
    if (isSkippable(char)) {
      continue; // Skip unwanted characters
    }
    if (char === "(") {
      tokens.push(token(TokenType.OpenParen, char));
    } else if (char === ")") {
      tokens.push(token(TokenType.CloseParen, char));
    } else if (char === "{") {
      tokens.push(token(TokenType.OpenBrace, char));
    } else if (char === "[") {
      tokens.push(token(TokenType.OpenBracket, char));
    } else if (char === "]") {
      tokens.push(token(TokenType.CloseBracket, char));
    } else if (char === "}") {
      tokens.push(token(TokenType.CloseBrace, char));
    }
    // Binary Operators the ( * is handled in the next if ) due the case of power operator
    else if (char === "+" || char === "-" || char === "/" || char === "%") {
      tokens.push(token(TokenType.BinaryOperator, char));
    } // Handle comparison and equals operators and power operator
    else if (
      char === "=" ||
      char === "!" ||
      char === "<" ||
      char === ">" ||
      char === "*"
    ) {
      let operator = char;
      // Look ahead for second character
      if (src[0] === "=") {
        operator += src.shift(); // eat the second character
        tokens.push(token(TokenType.ComparisonOperator, operator));
      } else if (src[0] === "*") {
        operator += src.shift(); // eat the second character
        tokens.push(token(TokenType.Power, operator));
      } else {
        // Single = is assignment, single < > are comparison
        if (char === "=") {
          tokens.push(token(TokenType.Equals, char));
        } else if (char === "*") {
          tokens.push(token(TokenType.BinaryOperator, char));
        } else if (char === "<" || char === ">") {
          tokens.push(token(TokenType.ComparisonOperator, char));
        } else {
          throwAnError("LexerError", `Unexpected operator: ${char}`);
        }
      }
    } else if (char === ",") {
      tokens.push(token(TokenType.Comma, char));
    } else if (char === ":") {
      tokens.push(token(TokenType.Colon, char));
    } else if (char === ";") {
      tokens.push(token(TokenType.Semicolon, char));
    } else if (char === ".") {
      tokens.push(token(TokenType.Dot, char));
    } else {
      // Start parsing multicharacter tokens

      // Handle string literals like "Hello World" or 'Hello World'
      if (char === '"' || char === "'") {
        const quoteType = char; // Remember which quote type we started with
        let str = "";
        while (src.length > 0 && src[0] !== quoteType) {
          str += src.shift() as string;
        }
        // Check if the string is terminated
        if (src.length === 0)
          throwAnError(
            "LexerError",
            `Unterminated string literal: Missing closing ${quoteType}`
          );
        src.shift(); // eat the closing quote
        tokens.push(token(TokenType.String, str));
      }

      // Handle numeric literals like integers
      else if (isInteger(char)) {
        let num = char;
        while (isInteger(src[0]) && src.length > 0) {
          num += src.shift() as string;
        }
        tokens.push(token(TokenType.Number, num));
      }

      // Handle identifiers and keywords
      else if (isAlphabet(char)) {
        let id = char; // haha, let, var, const, class, function, etc.
        while (isIdentifierChar(src[0]) && src.length > 0) {
          id += src.shift() as string;
        }

        // Check if the identifier is a keyword
        const reserved = KEYWORDS[id];
        if (typeof reserved === "number") {
          tokens.push(token(reserved, id));
        } else {
          tokens.push(token(TokenType.Identifier, id));
        }
      }

      // Unknown tokens
      else {
        throwAnError(
          "LexerError",
          `at the token [ ${char} ]: \n Token is not supported`
        );
      }
    }
  }

  // Push the EOF token
  tokens.push(token(TokenType.EOF, "EOF"));
  return tokens;
}

// Checks if the given character is a letter
function isAlphabet(char: string): boolean {
  return /^[a-zA-Z]+$/.test(char);
}

// Checks if the character can be part of an identifier (after first character)
function isIdentifierChar(char: string): boolean {
  return /^[a-zA-Z0-9_]$/.test(char);
}

// Checks if the given character is a digit
function isInteger(char: string): boolean {
  return /^[0-9]+$/.test(char);
}

// Checks if the given character is a whitespace
function isSkippable(char: string): boolean {
  return char === " " || char === "\n" || char === "\t" || char === "\r";
}
