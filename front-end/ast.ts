export type NodeType =
  | "Program"
  | "NumericLiteral"
  | "Identifier"
  | "BinaryExpression";
//   | "UnaryExpression"
//   | "CallExpression"
//   | "FunctionDeclaration";

// let x = 45; ( Is a Statement ) will return nothing
// In our scripting language statements don't return anything
// x = 5; ( Is an assignment expression ) will return 5

export interface Statement {
  kind: NodeType;
}

export interface Program extends Statement {
  kind: "Program";
  body: Statement[];
}

export interface Expression extends Statement {}

export interface BinaryExpression extends Expression {
  kind: "BinaryExpression";
  left: Expression;
  right: Expression;
  operator: string;
}

export interface Identifier extends Expression {
  kind: "Identifier";
  symbol: string;
}

export interface NumericLiteral extends Expression {
  kind: "NumericLiteral";
  value: number;
}
