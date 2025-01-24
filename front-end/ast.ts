//  ast.ts | Defines the structure of our languages AST

export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "NullLiteral"
  | "Identifier"
  | "BinaryExpression";
//   | "UnaryExpression"
//   | "CallExpression"
//   | "FunctionDeclaration";

// let x = 45; ( Is a Statement ) will return nothing
// In our scripting language statements don't return anything
// x = 5; ( Is an assignment expression ) will return 5

/**
 * Represents a statement.
 * - Statements will not result in a value at runtime
 */
export interface Statement {
  kind: NodeType;
}

/**
 * Represents a program.
 * - A program is a collection of statements
 * - The root of our AST
 */
export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

/**
 * Represents an expression.
 * - Expressions will result in a value at runtime
 */
export interface Expression extends Statement {}

/**
 * Represents a binary expression.
 * - Supported Operators: + | - | / | * | %
 */
export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: string;
}

/**
 * Represents a user-defined variable.
 */
export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

/**
 * Represents a numeric literal.
 */
export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}

export interface NullLiteral extends Expression {
  kind: "NullLiteral";
  value: "null";
}
