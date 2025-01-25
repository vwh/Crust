// expressions.ts | Evaluates the expressions in the runtime

import { evaluate } from "../interpreter";
import { makeNullValue, makeNumberValue } from "../values";
import { throwAnError } from "../../utils";

import type { BinaryExpression, Identifier } from "../../front-end/ast";
import type Environment from "../environment";
import type { NumberValue, RuntimeValue } from "../values";

// Evaluates the BinaryExpression AST
export function evaluateBinaryExpression(
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
export function evaluateNumericBinaryExpression(
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
export function evaluateIdentifier(
  identifier: Identifier,
  environment: Environment
): RuntimeValue {
  return environment.getVariable(identifier.symbol);
}
