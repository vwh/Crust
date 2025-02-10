//  ast.ts | Defines the structure of our languages AST

export type NodeType =
  // Statements
  | "Program"
  | "VariableDeclaration"
  | "FunctionDeclaration"
  | "IfStatement"
  | "WhileStatement"
  | "BreakStatement"
  | "ContinueStatement"

  // Expressions
  | "AssignmentExpression"
  | "BinaryExpression"
  | "UnaryExpression"
  | "MemberExpression"
  | "CallExpression"

  // Literals
  | "Property"
  | "ObjectLiteral"
  | "StringLiteral"
  | "NumericLiteral"
  | "Identifier";

// set x = 45; ( Is a Statement ) will return nothing
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
  body: Statement[]; // The statements in the program
}

/**
 * Represents a variable declaration.
 * - keep and set are both variable declarations
 */

export interface VariableDeclaration extends Statement {
  kind: "VariableDeclaration";
  constant: boolean; // Whether the variable is constant or not
  identifier: string; // The name of the variable
  value?: Expression; // it is optional because it may be undefined
}

/**
 * Represents a function declaration.
 */
export interface FunctionDeclaration extends Statement {
  kind: "FunctionDeclaration";
  name: string; // The name of the function
  parameters: string[]; // The parameters of the function
  body: Statement[]; // The code block that runs when the function is called
}

/**
 * Represents an if statement.
 * - Supported keywords: if, else, elif
 */
export interface IfStatement extends Statement {
  kind: "IfStatement";
  condition: Expression; // The condition to check (e.g., x > 0)
  consequent: Statement[]; // The code block that runs if condition is true
  alternate?: Statement[]; // The else block (optional)
}

/**
 * Represents a while loop statement.
 */
export interface WhileStatement extends Statement {
  kind: "WhileStatement";
  condition: Expression; // The condition to check (e.g., x > 0)
  body: Statement[]; // The code block that runs if condition is true
}

/**
 * Represents a break statement.
 */
export interface BreakStatement extends Statement {
  kind: "BreakStatement";
}

/**
 * Represents a continue statement.
 */
export interface ContinueStatement extends Statement {
  kind: "ContinueStatement";
}

/**
 * Represents an expression.
 * - Expressions will result in a value at runtime
 */
export interface Expression extends Statement {}

/**
 * Represents an assignment expression.
 * - Supported Operators: =
 */
export interface AssignmentExpression extends Expression {
  kind: "AssignmentExpression";
  assignment: Expression; // The value to assign
  value: Expression; // The value to assign to
}

/**
 * Represents a member expression.
 * - Supported Operators:
 *  foo.bar()
 *  foo["bar"]() // this is computed
 */
export interface MemberExpression extends Expression {
  kind: "MemberExpression";
  object: Expression; // The object to access
  property: Expression; // The property to access
  computed: boolean; // Whether the property is computed or not like foo["bar"]
}

/**
 * Represents a call expression.
 */
export interface CallExpression extends Expression {
  kind: "CallExpression";
  caller: Expression; // The function to call
  arguments: Expression[]; // The arguments to pass to the function
}

/**
 * Represents a binary expression.
 * - Handles all ( MultiplicativeExpression, AdditiveExpression, ComparisonExpression )
 * - Supported Operators: + | - | / | * | % || ** || >= || <= || == || != || > || <
 */
export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression; // The left side of the expression
  right: Expression; // The right side of the expression
  operator: string; // The operator to use
}

/**
 * Represents a unary expression.
 * - Supported Operators: !
 */
export interface UnaryExpression extends Expression {
  kind: "UnaryExpression";
  operator: string; // The operator to use
  argument: Expression; // The value to use
}

/**
 * Represents a user-defined variable.
 */
export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string; // The name of the variable
}

/**
 * Represents a numeric literal.
 */
export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number; // The value of the literal
}

/**
 * Represents a string literal.
 */
export interface StringLiteral extends Expression {
  kind: "StringLiteral";
  value: string; // The value of the literal
}

/**
 * Represents an Object Property.
 */
export interface Property extends Expression {
  kind: "Property";
  key: string; // The key of the property
  value?: Expression; // it is optional because it may be undefined
}

/**
 * Represents a Object Literal.
 */
export interface ObjectLiteral extends Expression {
  kind: "ObjectLiteral";
  properties: Property[]; // The properties of the object
}
