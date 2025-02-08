// statments.ts | Evaluates the statements in the runtime

import { evaluate } from "../interpreter";
import { makeNullValue } from "../values";

import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
} from "../../front-end/ast";
import type Environment from "../environment";
import type { FunctionValue, RuntimeValue } from "../values";
import { env } from "bun";

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
