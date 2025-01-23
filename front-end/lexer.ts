// lexer.ts | Responsible for producing tokens from the source code

// Represents the type of a token our lexer produces
export enum TokenType {
  // Literal
  Number,
  Identifier,

  // Keywords
  Let,

  // Operators
  Equals,
  BinaryOperator,
  OpenParen,
  CloseParen,
  EOF, // End of File
}

// Represents a single token from the source code
export interface Token {
  type: TokenType;
  value: string;
}

// Keywords, Constant lookup for keywords and known identifiers and symbols
const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
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
    } // Binary Operators
    else if (
      char === "+" ||
      char === "-" ||
      char === "*" ||
      char === "/" ||
      char === "%"
    ) {
      tokens.push(token(TokenType.BinaryOperator, char));
    } else if (char === "=") {
      tokens.push(token(TokenType.Equals, char));
    } else {
      // Start parsing multicharacter tokens

      // Handle numeric literals like integers
      if (isInteger(char)) {
        let num = char;
        while (isInteger(src[0]) && src.length > 0) {
          num += src.shift() as string;
        }
        tokens.push(token(TokenType.Number, num));
      } // Handle identifiers and keywords
      else if (isAlphabet(char)) {
        let id = char; // haha, let, var, const, class, function, etc.
        while (isAlphabet(src[0]) && src.length > 0) {
          id += src.shift() as string;
        }

        // Check if the identifier is a keyword
        const reserved = KEYWORDS[id];
        if (reserved) {
          tokens.push(token(reserved, id));
        } else {
          tokens.push(token(TokenType.Identifier, id));
        }
      } // Handle unknown tokens
      else {
        console.error("Unknown token:", char);
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

// Checks if the given character is a digit
function isInteger(char: string): boolean {
  return /^[0-9]+$/.test(char);
}

// Checks if the given character is a whitespace
function isSkippable(char: string): boolean {
  return char === " " || char === "\n" || char === "\t";
}
