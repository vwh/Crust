// interpreter.ts | Responsible for evaluating the AST

import type {
  Statement,
  NumericLiteral,
  BinaryExpression,
  Program,
  Identifier,
} from "../front-end/ast";
import {
  type RuntimeValue,
  type NumberValue,
  type NullValue,
  makeNullValue,
} from "./values";
import type Environment from "./environment";

// Evaluates the Program AST
function evaluateProgram(
  program: Program,
  environment: Environment
): RuntimeValue {
  let lastEvaluated: RuntimeValue = {
    type: "null",
    value: null,
  } as RuntimeValue;

  for (const statement of program.body) {
    lastEvaluated = evaluate(statement, environment);
  }

  return lastEvaluated;
}

// Evaluates the BinaryExpression AST
function evaluateBinaryExpression(
  BinaryExpression: BinaryExpression,
  environment: Environment
): RuntimeValue {
  const left = evaluate(BinaryExpression.left, environment);
  const right = evaluate(BinaryExpression.right, environment);

  if (left.type === "number" && right.type === "number") {
    return evaluateNumericBinaryExpression(
      left as NumberValue,
      right as NumberValue,
      BinaryExpression.operator
    );
  }

  // One or both are NULL
  return makeNullValue();
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

// Evaluates the Identifier AST
function evaluateIdentifier(
  identifier: Identifier,
  environment: Environment
): RuntimeValue {
  return environment.getVariable(identifier.symbol);
}

// Evaluates the AST
export function evaluate(
  ast: Statement,
  environment: Environment
): RuntimeValue {
  switch (ast.kind) {
    case "Program":
      return evaluateProgram(ast as Program, environment);
    case "NumericLiteral":
      return {
        type: "number",
        value: (ast as NumericLiteral).value,
      } as NumberValue;
    case "NullLiteral":
      return makeNullValue();
    case "BinaryExpression":
      return evaluateBinaryExpression(ast as BinaryExpression, environment);
    case "Identifier":
      return evaluateIdentifier(ast as Identifier, environment);

    // Unhandled AST node
    default: {
      console.error("This AST node is not supported yet:", ast);
      process.exit(1);
    }
  }
}
