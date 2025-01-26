//  ast.ts | Defines the structure of our languages AST

export type NodeType =
  // Statements
  | "Program"
  | "VariableDeclaration"

  // Expressions
  | "AssignmentExpression"
  | "BinaryExpression"

  // Literal
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "Identifier";

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

export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expression; // it is optional because it may be undefined
}

/**
 * Represents an expression.
 * - Expressions will result in a value at runtime
 */
export interface Expression extends Statement {}

/**
 * Represents an assignment expression.
 */
export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assignment: Expression;
  value: Expression;
}

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

/**
 * Represents an Object Property.
 */
export interface Property extends Expression {
  kind: "Property";
  key: string;
  value?: Expression;
}

/**
 * Represents a Object Literal.
 */
export interface ObjectLiteral extends Expression {
  kind: "ObjectLiteral";
  properties: Property[];
}
