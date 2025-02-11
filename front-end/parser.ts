// parser.ts | Responsible for parsing the source code into an AST

import { tokenizer, TokenType } from "./lexer";
import { getNameOfToken, throwAnError } from "../utils/errors";

import type { Token } from "./lexer";
import type {
  Statement,
  Program,
  Expression,
  BinaryExpression,
  Identifier,
  NumericLiteral,
  VariableDeclaration,
  AssignmentExpression,
  Property,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
  FunctionDeclaration,
  StringLiteral,
  IfStatement,
  UnaryExpression,
  WhileStatement,
  BreakStatement,
  ContinueStatement,
  BlockStatement,
  TryCatchStatement,
} from "./ast";

// --- Orders Of Expression Precedence ---
// AssignmentExpression ( Lowest )
// ObjectExpression
// LogicalExpression (&&, ||)
// ComparisonExpression (==, !=, <, >, <=, >=)
// AdditiveExpression (+, -)
// MultiplicitaveExpression (*, /, %, **, //)
// CallExpression
// MemberExpression
// UnaryExpression (!, -, +)
// PrimaryExpression ( Highest )

/**
 * Front-end parser responsible for parsing the source code into an AST
 */
export default class Parser {
  private tokens: Token[] = [];

  // Produces the AST from the source code
  public produceAst(soruceCode: string): Program {
    this.tokens = tokenizer(soruceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse the program body until the end of the file
    while (this.notEOF()) program.body.push(this.parseStatement());
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

    // If the previous token is not of the given type
    if (previous.type !== type || !previous) {
      throwAnError(
        "ParseError",
        `Expected [ ${getNameOfToken(type)} ] but got [ ${
          previous.value
        } ]\n ${errorMessage}`
      );
    }

    return previous;
  }

  // Handle statements parsing
  private parseStatement(): Statement {
    switch (this.tokenAt().type) {
      case TokenType.OpenBrace:
        return this.parseBlockStatement();
      case TokenType.Fn:
        return this.parseFunctionDeclaration();
      case TokenType.Set:
      case TokenType.Keep:
        return this.parseVariableDeclaration();
      case TokenType.If:
      case TokenType.Elif:
        return this.parseIfStatement();
      case TokenType.While:
        return this.parseWhileStatement();
      case TokenType.Try:
        return this.parseTryStatement();
      case TokenType.Break: {
        this.eatToken(); // Eat the break keyword
        return {
          kind: "BreakStatement",
        } as BreakStatement;
      }
      case TokenType.Continue: {
        this.eatToken(); // Eat the continue keyword
        return {
          kind: "ContinueStatement",
        } as ContinueStatement;
      }

      // Handle expressions
      default:
        return this.parseExpression();
    }
  }

  // Handle block statements parsing
  private parseBlockStatement(): BlockStatement {
    this.expectToken(
      TokenType.OpenBrace,
      "Expected opening brace at the start of a block statement"
    );

    const body: Statement[] = [];
    while (this.notEOF() && this.tokenAt().type !== TokenType.CloseBrace) {
      body.push(this.parseStatement());
    }

    this.expectToken(
      TokenType.CloseBrace,
      "Expected closing brace at the end of a block statement"
    );

    return {
      kind: "BlockStatement",
      statements: body,
    };
  }

  // Handle variable declarations parsing
  // set identifier;
  // ( keep | set ) identifier = expression;
  private parseVariableDeclaration(): Statement {
    const isConstant = this.eatToken().type === TokenType.Keep;
    const identifier = this.expectToken(
      TokenType.Identifier,
      "Expected identifier name for variable declaration"
    ).value;

    // Parsing the set identifier;
    if (this.tokenAt().type !== TokenType.Equals) {
      this.eatToken(); // Eat the semicolon
      if (isConstant)
        throwAnError(
          "ParseError",
          `Expected an equals sign to assign a value to the variable [ ${identifier} ] must assign a value to a constant expression`
        );

      return {
        kind: "VariableDeclaration",
        constant: false,
        identifier,
        value: undefined,
      } as VariableDeclaration;
    }

    this.expectToken(
      TokenType.Equals,
      "Expected an equals sign to assign a value to the variable"
    );

    // Parsing the set identifier = expression;
    const declaration: VariableDeclaration = {
      kind: "VariableDeclaration",
      constant: isConstant,
      identifier,
      value: this.parseExpression(),
    };

    return declaration;
  }

  // Handle function declarations parsing
  private parseFunctionDeclaration(): Statement {
    this.eatToken(); // Eat the fn keyword

    const name = this.expectToken(
      TokenType.Identifier,
      "Expected identifier name for function declaration"
    ).value;

    const args = this.parseArguments();

    // parseArguments returns expressions, but we need to convert them to strings
    // As we are handling arguments not parameters
    const parameters: string[] = [];
    for (const arg of args) {
      if (arg.kind !== "Identifier")
        throwAnError(
          "ParseError",
          `Expected a string identifier for function parameter but got [ ${arg.kind} ]`
        );

      parameters.push((arg as Identifier).symbol);
    }

    const body = this.parseBlockStatement();

    const fn = {
      kind: "FunctionDeclaration",
      name,
      parameters,
      body,
    } as FunctionDeclaration;

    return fn;
  }

  // Handle if statements parsing
  private parseIfStatement(): Statement {
    this.eatToken(); // Eat the if keyword

    const condition = this.parseExpression();

    const consequent = this.parseBlockStatement();

    const alternate = {
      kind: "BlockStatement",
      statements: [],
    } as BlockStatement;
    if (
      this.tokenAt().type === TokenType.Else ||
      this.tokenAt().type === TokenType.Elif
    ) {
      const isElif = this.tokenAt().type === TokenType.Elif;

      if (isElif) {
        alternate.statements.push(this.parseStatement());
      } else {
        this.eatToken(); // Eat the else token
        alternate.statements.push(...this.parseBlockStatement().statements); // The code block that runs if condition is true
      }
    }

    return {
      kind: "IfStatement",
      condition,
      consequent,
      alternate,
    } as IfStatement;
  }

  // Handle while loop statements parsing
  private parseWhileStatement(): Statement {
    this.eatToken(); // Eat the while keyword

    const condition = this.parseExpression();
    const body = this.parseBlockStatement();

    return {
      kind: "WhileStatement",
      condition,
      body,
    } as WhileStatement;
  }

  private parseTryStatement(): Statement {
    this.eatToken(); // Eat the try keyword

    const tryBlock = this.parseBlockStatement();

    if (this.tokenAt().type !== TokenType.Catch) {
      throwAnError(
        "ParseError",
        `Expected catch keyword after try block but got [ ${getNameOfToken(
          this.tokenAt().type
        )} ]`
      );
    }

    this.eatToken(); // Eat the catch keyword

    let errorSymbol: string | undefined;
    if (this.tokenAt().type === TokenType.OpenParen) {
      this.eatToken(); // Eat the (
      errorSymbol = this.expectToken(
        TokenType.Identifier,
        "Expected identifier for error name"
      ).value;

      this.expectToken(
        TokenType.CloseParen,
        "Expected closing brace at the end of the error name"
      );
    }

    const catchBlock = this.parseBlockStatement();

    return {
      kind: "TryCatchStatement",
      tryBlock,
      catchBlock,
      errorSymbol,
    } as TryCatchStatement;
  }

  // Handle expressions parsing
  private parseExpression(): Expression {
    return this.parseAssignmentExpression();
  }

  // Handle assignment expressions parsing assignment expressions
  private parseAssignmentExpression(): Expression {
    const left = this.parseObjectExpression();

    if (this.tokenAt().type === TokenType.Equals) {
      this.eatToken(); // Eat the equals
      const value = this.parseAssignmentExpression(); // Allowing chained assignments like ( x = y = z = 69 )
      return {
        kind: "AssignmentExpression",
        assignment: left,
        value,
      } as AssignmentExpression;
    }

    return left;
  }

  // Handle logical expressions parsing
  private parseLogicalExpression(): Expression {
    let left = this.parseComparisonExpression();

    while (this.tokenAt().type === TokenType.LogicalOperator) {
      const operator = this.eatToken();
      const right = this.parseComparisonExpression();

      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator: operator.value,
      } as BinaryExpression;
    }

    return left;
  }

  // Handle object expressions parsing object expressions
  private parseObjectExpression(): Expression {
    if (this.tokenAt().type !== TokenType.OpenBrace) {
      return this.parseLogicalExpression();
    }

    this.eatToken(); // Eat the open brace
    const properties: Property[] = [];

    while (this.notEOF() && this.tokenAt().type !== TokenType.CloseBrace) {
      // Get the property key
      const key = this.expectToken(
        TokenType.Identifier,
        "Expected an identifier for the object property key"
      ).value;

      // Handle shorthand property syntax { key, }
      if (this.tokenAt().type === TokenType.Comma) {
        this.eatToken(); // Eat the comma
        properties.push({
          kind: "Property",
          key,
          value: undefined,
        });
        continue;
      }

      // Handle shorthand property syntax { key }
      if (this.tokenAt().type === TokenType.CloseBrace) {
        properties.push({
          kind: "Property",
          key,
          value: undefined,
        });
        continue;
      }

      // Handle full property syntax { key: value }
      this.expectToken(
        TokenType.Colon,
        "Expected colon following property key"
      );

      const value = this.parseExpression();
      properties.push({
        kind: "Property",
        key,
        value,
      });

      // Handle comma after property
      if (this.tokenAt().type !== TokenType.CloseBrace) {
        this.expectToken(
          TokenType.Comma,
          "Expected comma to separate object properties"
        );
      }
    }

    this.expectToken(
      TokenType.CloseBrace,
      "Expected closing brace after object literal"
    );

    return {
      kind: "ObjectLiteral",
      properties,
    } as ObjectLiteral;
  }

  // Handle comparison expressions parsing ( Equality, Inequality )
  private parseComparisonExpression(): Expression {
    let left = this.parseAdditiveExpression();

    while (this.tokenAt().type === TokenType.ComparisonOperator) {
      const operator = this.eatToken();
      const right = this.parseAdditiveExpression();

      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator: operator.value,
      } as BinaryExpression;
    }

    return left;
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
    let left = this.parseCallMemberExpression();

    while (
      this.tokenAt().value === "/" ||
      this.tokenAt().value === "*" ||
      this.tokenAt().value === "%" ||
      this.tokenAt().value === "**" ||
      this.tokenAt().value === "//"
    ) {
      const operator = this.eatToken();
      const right = this.parseCallMemberExpression();

      left = {
        kind: "BinaryExpression",
        left,
        right,
        operator: operator.value,
      } as BinaryExpression;
    }

    return left;
  }

  // Handle call member expressions parsing ( Function call )
  // foo.bar ()
  private parseCallMemberExpression(): Expression {
    const member = this.parseMemberExpression();

    if (this.tokenAt().type === TokenType.OpenParen) {
      return this.parseCallExpression(member);
    }

    return member;
  }

  // Handle call expressions parsing ( Function call )
  // like foo ()
  private parseCallExpression(caller: Expression): Expression {
    let callExpression: Expression = {
      kind: "CallExpression",
      caller: caller,
      arguments: this.parseArguments(),
    } as CallExpression;

    // To handle chain function calls, the case of foo.bar()()()
    if (this.tokenAt().type === TokenType.OpenParen) {
      callExpression = this.parseCallExpression(callExpression);
    }

    return callExpression;
  }

  // Handles the function call arguments
  private parseArguments(): Expression[] {
    this.expectToken(
      TokenType.OpenParen,
      "Expected opening parenthesis at the start of arguments"
    );

    const args =
      this.tokenAt().type === TokenType.CloseParen
        ? []
        : this.parseArgumentsList();

    this.expectToken(
      TokenType.CloseParen,
      "Expected closing parenthesis at the end of arguments"
    );

    return args;
  }

  // Handles parsing a list of arguments in a function call
  private parseArgumentsList(): Expression[] {
    const args = [this.parseAssignmentExpression()];

    // Loop until we reach the end of the arguments list
    while (this.tokenAt().type === TokenType.Comma && this.eatToken()) {
      args.push(this.parseAssignmentExpression());
    }

    return args;
  }

  // Handles parsing member expressions
  // Like foo.bar.baz
  private parseMemberExpression(): Expression {
    let object = this.parseUnaryExpression();

    while (
      this.tokenAt().type === TokenType.Dot ||
      this.tokenAt().type === TokenType.OpenBracket
    ) {
      const operator = this.eatToken();
      let property: Expression;
      let computed = false;

      // Non-computed property
      if (operator.type === TokenType.Dot) {
        // Getting the identifier after the dot
        property = this.parseUnaryExpression();

        if (property.kind !== "Identifier")
          throwAnError(
            "ParseError",
            `Expected an identifier after the dot operator but got [ ${property.kind} ]`
          );
      }
      // Computed property
      else {
        computed = true;
        property = this.parseExpression();

        this.expectToken(
          TokenType.CloseBracket,
          "Expected closing bracket at the end of computed property"
        );
      }

      object = {
        kind: "MemberExpression",
        object,
        property,
        computed,
      } as MemberExpression;
    }

    return object;
  }

  // Handle unary expressions parsing
  private parseUnaryExpression(): Expression {
    if (this.tokenAt().type !== TokenType.UnaryOperator) {
      return this.parsePrimaryExpression();
    }

    const operator = this.eatToken(); // Eat the operator
    const argument = this.parsePrimaryExpression();

    return {
      kind: "UnaryExpression",
      operator: operator.value,
      argument,
    } as UnaryExpression;
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
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: Number.parseFloat(token.value),
        } as NumericLiteral;
      case TokenType.String:
        return {
          kind: "StringLiteral",
          value: token.value,
        } as StringLiteral;
      case TokenType.OpenParen: {
        const value = this.parseExpression();
        this.expectToken(
          TokenType.CloseParen,
          "Unexpected token found in parenthesis"
        );
        return value;
      }

      // Unhandled tokens
      default:
        throwAnError("ParseError", `Not supported token [ ${token.value} ]`);
    }
  }
}
