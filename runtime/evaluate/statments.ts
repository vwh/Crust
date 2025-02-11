// statments.ts | Evaluates the statements in the runtime

import { evaluate } from "../interpreter";
import { makeNullValue } from "../values";

import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
  IfStatement,
  WhileStatement,
} from "../../front-end/ast";
import type Environment from "../environment";
import type { BooleanValue, FunctionValue, RuntimeValue } from "../values";
import { throwAnError } from "../../utils/errors";

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

  environment.declareVariable(functionDeclaration.name, fn, true);

  return makeNullValue();
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

  // If condition is true, evaluate all consequent statements
  if (condition.type === "boolean" && condition.value) {
    let lastEvaluated: RuntimeValue = makeNullValue();
    for (const statement of expressionStatement.consequent) {
      lastEvaluated = evaluate(statement, environment);
    }

    return lastEvaluated;
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

    let lastEvaluated: RuntimeValue = makeNullValue();
    for (const statement of expressionStatement.alternate) {
      lastEvaluated = evaluate(statement, environment);
    }

    return lastEvaluated;
  }

  return makeNullValue();
}

// Evaluates the While loop Statement AST
export function evaluateWhileStatement(
  whileStatement: WhileStatement,
  environment: Environment
): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNullValue();

  while (true) {
    const condition = evaluate(
      whileStatement.condition,
      environment
    ) as BooleanValue;

    if (condition.type !== "boolean") {
      return throwAnError(
        "RuntimeError",
        `at the while loop condition [ ${condition} ]: \n While loop condition is not a boolean`
      );
    }

    if (!condition.value) break; // Exit outer loop when condition is false

    let shouldBreak = false; // Track when to break the outer loop
    let shouldContinue = false; // Track when to restart the outer loop

    let i = 0;
    while (i < whileStatement.body.length) {
      const statement = whileStatement.body[i];
      try {
        lastEvaluated = evaluate(statement, environment);
      } catch (error) {
        // Break/Continue signals
        if (error instanceof Error) {
          if (error.message === "break") {
            shouldBreak = true; // Signal outer loop break
            break; // Exit inner loop immediately
          }
          if (error.message === "continue") {
            shouldContinue = true; // Signal outer loop restart
            break; // Exit inner loop immediately
          }

          throw error;
        }
      }

      i++;
    }

    if (shouldBreak) break; // Break outer loop
    if (shouldContinue) continue; // Restart outer loop immediately
  }

  return lastEvaluated;
}
