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
  makeNullValue,
  makeNumberValue,
} from "./values";
import type Environment from "./environment";
import { throwAnError } from "../utils";

// Evaluates the Program AST
function evaluateProgram(
  program: Program,
  environment: Environment
): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNullValue();

  // Evaluate the program body statements
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

  // if left hand side is a number and right hand side is a number
  if (left.type === "number" && right.type === "number") {
    return evaluateNumericBinaryExpression(
      left as NumberValue,
      right as NumberValue,
      BinaryExpression.operator
    );
  }

  // if both sides are not numbers or one of them
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
    return throwAnError(
      "RuntimeError",
      `at the operator [ ${operator} ]: \n Operator is not supported`
    );
  }

  return makeNumberValue(result);
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
      return makeNumberValue((ast as NumericLiteral).value);
    case "BinaryExpression":
      return evaluateBinaryExpression(ast as BinaryExpression, environment);
    case "Identifier":
      return evaluateIdentifier(ast as Identifier, environment);

    // Unhandled AST node
    default: {
      return throwAnError(
        "RuntimeError",
        `at the ast [ ${ast} ]: \n This AST node is not supported yet`
      );
    }
  }
}
