// parser.ts | Responsible for parsing the source code into an AST

import type {
  Statement,
  Program,
  Expression,
  BinaryExpression,
  Identifier,
  NumericLiteral,
  NullLiteral,
} from "./ast";
import { tokenizer, type Token, TokenType } from "./lexer";
import { logNameOfToken } from "../utils";

/**
 * Front-end parser responsible for parsing the source code into an AST
 */
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

  // Checks if the current token is the end of the file
  private notEOF(): boolean {
    return this.tokenAt().type !== TokenType.EOF;
  }

  // Returns the token at the given index
  private tokenAt(index = 0): Token {
    return this.tokens[index];
  }

  // Eats the token at the front of the token list
  private eatToken(): Token {
    const previous = this.tokenAt();
    return this.tokens.shift() as Token;
  }

  // Eats the token at the front of the token list and checks if it is of the given type
  private expectToken(type: TokenType, errorMessage: string): Token {
    const previous = this.eatToken();
    if (previous.type !== type || !previous) {
      console.error(
        `Parse error at ( ${
          previous.value
        } ):\n ${errorMessage} \n Expected ${logNameOfToken(type)}`
      );
      process.exit(1);
    }
    return previous;
  }

  // Handle statements parsing
  private parseStatement(): Statement {
    // we don't have statements yet other than Program
    return this.parseExpression();
  }

  // --- Orders Of Expression Precedence ---
  // AdditiveExpression
  // MultiplicitaveExpression
  // PrimaryExpression

  // Handle expressions parsing
  private parseExpression(): Expression {
    return this.parseAdditiveExpression();
  }

  // Handle additive expressions parsing ( Addition, Subtraction )
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

  // Handle multiplicative expressions parsing ( Multiplication, Division, Modulo )
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

  // Handle primary expressions parsing ( Identifiers, Numbers, Parentheses )
  private parsePrimaryExpression(): Expression {
    const token = this.eatToken();

    switch (token.type) {
      case TokenType.Identifier:
        return {
          kind: "Identifier",
          symbol: token.value,
        } as Identifier;
      case TokenType.Null:
        return {
          kind: "NullLiteral",
          value: null,
        } as NullLiteral;
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
