// statments.ts | Evaluates the statements in the runtime

import { evaluate } from "../interpreter";
import { makeNullValue } from "../values";

import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
  IfStatement,
} from "../../front-end/ast";
import type Environment from "../environment";
import type { BooleanValue, FunctionValue, RuntimeValue } from "../values";

// Evaluates the Program AST
export function evaluateProgram(
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

// Evaluates the Variable Declaration AST
export function evaluateVariableDeclaration(
  variableDeclaration: VariableDeclaration,
  environment: Environment
) {
  let value: RuntimeValue = makeNullValue();
  if (variableDeclaration.value) {
    value = evaluate(variableDeclaration.value, environment);
  }

  environment.declareVariable(
    variableDeclaration.identifier,
    value,
    variableDeclaration.constant
  );

  return undefined as unknown as RuntimeValue;
}

// Evaluates the Function Declaration AST
export function evaluateFunctionDeclaration(
  functionDeclaration: FunctionDeclaration,
  environment: Environment
) {
  const fn = {
    type: "function",
    name: functionDeclaration.name,
    parameters: functionDeclaration.parameters,
    environment,
    body: functionDeclaration.body,
  } as FunctionValue;

  return environment.declareVariable(functionDeclaration.name, fn, true);
}

// Evaluates the If Statement AST
export function evaluateIfStatement(
  expressionStatement: IfStatement,
  environment: Environment
): RuntimeValue {
  const condition = evaluate(
    expressionStatement.condition,
    environment
  ) as BooleanValue;

  // If condition is true, evaluate consequent and return
  if (condition.type === "boolean" && condition.value) {
    for (const statement of expressionStatement.consequent)
      evaluate(statement, environment);
    return makeNullValue();
  }

  // If condition is false and there's an alternate, evaluate it
  if (
    expressionStatement.alternate &&
    expressionStatement.alternate.length > 0
  ) {
    // Handle elif (which is a statement in alternate)
    if (expressionStatement.alternate[0].kind === "IfStatement") {
      return evaluate(expressionStatement.alternate[0], environment);
    }
    // Handle else block
    for (const statement of expressionStatement.alternate) {
      evaluate(statement, environment);
    }
  }

  return makeNullValue();
}
