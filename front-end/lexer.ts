// let n = 25;

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
  EOF,
}

export interface Token {
  type: TokenType;
  value: string;
}

const KEYWORDS: Record<string, TokenType> = {
  let: TokenType.Let,
};

function token(type: TokenType, value: string): Token {
  return { type, value };
}

export function tokenizer(soruceCode: string): Token[] {
  const tokens: Token[] = [];

  const src = soruceCode.split("");

  while (src.length > 0) {
    const char = src.shift() as string;

    if (isSkippable(char)) {
      continue;
    }

    if (char === "(") {
      tokens.push(token(TokenType.OpenParen, char));
    } else if (char === ")") {
      tokens.push(token(TokenType.CloseParen, char));
    } else if (
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
      // handle multicharacter tokens
      if (isInteger(char)) {
        let num = char;
        while (isInteger(src[0]) && src.length > 0) {
          num += src.shift() as string;
        }
        tokens.push(token(TokenType.Number, num));
      } else if (isAlphabet(char)) {
        let id = char; // haha, let, var, const, class, function, etc.
        while (isAlphabet(src[0]) && src.length > 0) {
          id += src.shift() as string;
        }

        const reserved = KEYWORDS[id];
        if (reserved) {
          tokens.push(token(reserved, id));
        } else {
          tokens.push(token(TokenType.Identifier, id));
        }
      } else {
        console.error("Unknown token:", char);
      }
    }
  }

  tokens.push(token(TokenType.EOF, "EOF"));
  return tokens;
}

function isAlphabet(src: string): boolean {
  return /^[a-zA-Z]+$/.test(src);
}

function isInteger(src: string): boolean {
  return /^[0-9]+$/.test(src);
}

function isSkippable(src: string): boolean {
  return src === " " || src === "\n" || src === "\t";
}

function printNameOfToken(token: Token): string {
  switch (token.type) {
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

// const code = `
// let a = ((10 + 20) * 30);
// let b = 20
// let c = a + b
// `;

// const tokens = tokenizer(code);
// for (const token of tokens) {
//   console.log(printNameOfToken(token), token.value);
// }
