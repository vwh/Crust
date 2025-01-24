// interpreter.ts | Responsible for evaluating the AST

import type { RuntimeValue, NumberValue, NullValue } from "./values";
import type {
  Statement,
  NumericLiteral,
  BinaryExpression,
  Program,
} from "../front-end/ast";

// Evaluates the Program AST
function evaluateProgram(program: Program): RuntimeValue {
  let lastEvaluated: RuntimeValue = {
    type: "null",
    value: "null",
  } as RuntimeValue;

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement);
  }

  return lastEvaluated;
}

// Evaluates the BinaryExpression AST
function evaluateBinaryExpression(
  BinaryExpression: BinaryExpression
): RuntimeValue {
  const left = evaluate(BinaryExpression.left);
  const right = evaluate(BinaryExpression.right);

  if (left.type === "number" && right.type === "number") {
    return evaluateNumericBinaryExpression(
      left as NumberValue,
      right as NumberValue,
      BinaryExpression.operator
    );
  }

  // One or both are NULL
  return {
    type: "null",
    value: "null",
  } as NullValue;
}

// Evaluates the Numeric Binary Expression
function evaluateNumericBinaryExpression(
  left: NumberValue,
  right: NumberValue,
  operator: string
): RuntimeValue {
  let result = 0;

  if (operator === "+") {
    result = left.value + right.value;
  } else if (operator === "-") {
    result = left.value - right.value;
  } else if (operator === "*") {
    result = left.value * right.value;
  } else if (operator === "/") {
    // TODO: Handle division by zero
    result = left.value / right.value;
  } else if (operator === "%") {
    result = left.value % right.value;
  } else {
    console.error("Unknown operator:", operator);
    process.exit(1);
  }

  return {
    type: "number",
    value: result,
  } as NumberValue;
}

// Evaluates the AST
export function evaluate(ast: Statement): RuntimeValue {
  switch (ast.kind) {
    case "Program":
      return evaluateProgram(ast as Program);
    case "NumericLiteral":
      return {
        type: "number",
        value: (ast as NumericLiteral).value,
      } as NumberValue;
    case "NullLiteral":
      return {
        type: "null",
        value: "null",
      } as NullValue;
    case "BinaryExpression":
      return evaluateBinaryExpression(ast as BinaryExpression);
    default: {
      console.error("This AST node is not supported yet:", ast);
      process.exit(1);
    }
  }
}
