import type {
  Statement,
  Program,
  Expression,
  BinaryExpression,
  Identifier,
  NumericLiteral,
} from "./ast";

import { tokenizer, type Token, TokenType } from "./lexer";

export default class Parser {
  private tokens: Token[] = [];

  public produceAst(soruceCode: string): Program {
    this.tokens = tokenizer(soruceCode);

    const program: Program = {
      kind: "Program",
      body: [],
    };

    while (this.notEOF()) {
      program.body.push(this.parseStatement());
    }

    return program;
  }

  private tokenAt(index = 0): Token {
    return this.tokens[index];
  }

  private eatToken(): Token {
    const previous = this.tokenAt();
    return this.tokens.shift() as Token;
  }

  private expectToken(type: TokenType, errorMessage: string): Token {
    const previous = this.eatToken();
    if (previous.type !== type || !previous) {
      console.error(
        `Parse error at ( ${previous.value} ):\n ${errorMessage} \n Expected ${type}`
      );
      process.exit(1);
    }
    return previous;
  }

  private notEOF(): boolean {
    return this.tokenAt().type !== TokenType.EOF;
  }

  private parseStatement(): Statement {
    // we don't have statements yet other than Program
    return this.parseExpression();
  }

  // --- Orders Of Precedence ---
  // AdditiveExpression
  // MultiplicitaveExpression
  // PrimaryExpression

  private parseExpression(): Expression {
    return this.parseAdditiveExpression();
  }

  private parseAdditiveExpression(): Expression {
    let left = this.parseMultiplicativeExpression();

    while (this.tokenAt().value === "+" || this.tokenAt().value === "-") {
      const operator = this.eatToken();
      const right = this.parseMultiplicativeExpression();

      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator: operator.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parseMultiplicativeExpression(): Expression {
    let left = this.parsePrimaryExpression();

    while (
      this.tokenAt().value === "/" ||
      this.tokenAt().value === "*" ||
      this.tokenAt().value === "%"
    ) {
      const operator = this.eatToken();
      const right = this.parsePrimaryExpression();

      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator: operator.value,
      } as BinaryExpression;
    }

    return left;
  }

  private parsePrimaryExpression(): Expression {
    const token = this.eatToken();

    switch (token.type) {
      case TokenType.Identifier:
        return {
          kind: "Identifier",
          symbol: token.value,
        } as Identifier;
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: Number.parseFloat(token.value),
        } as NumericLiteral;
      case TokenType.OpenParen: {
        const value = this.parseExpression();
        this.expectToken(
          TokenType.CloseParen,
          "Unexpected token found in parenthesis"
        );
        return value;
      }
      default:
        // TODO: MAKE ERROR MESSAGES
        console.error("Debug.Error: Unknown token:", token);
        process.exit(1);
    }
  }
}
