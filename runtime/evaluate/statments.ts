// statments.ts | Evaluates the statements in the runtime

import { evaluate } from "../interpreter";
import { makeErrorValue, makeNullValue } from "../values";

import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
  IfStatement,
  WhileStatement,
  BlockStatement,
  TryCatchStatement,
} from "../../front-end/ast";
import Environment from "../environment";
import type { BooleanValue, FunctionValue, RuntimeValue } from "../values";
import { CrustError, throwAnError } from "../../utils/errors";

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
    body: functionDeclaration.body.statements,
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
    return evaluateBlockStatement(expressionStatement.consequent, environment);
  }

  // If condition is false and there's an alternate, evaluate it
  if (
    expressionStatement.alternate &&
    expressionStatement.alternate.statements.length > 0
  ) {
    // Handle elif (which is a statement in alternate)
    if (expressionStatement.alternate.statements[0].kind === "IfStatement") {
      return evaluate(expressionStatement.alternate.statements[0], environment);
    }

    return evaluateBlockStatement(expressionStatement.alternate, environment);
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
      throwAnError(
        "RuntimeError",
        `The condition of the while loop must be a boolean but got [ ${condition.type} ]`
      );
    }

    if (!condition.value) break; // Exit outer loop when condition is false

    let shouldBreak = false; // Track when to break the outer loop
    let shouldContinue = false; // Track when to restart the outer loop

    let i = 0;
    while (i < whileStatement.body.statements.length) {
      const statement = whileStatement.body.statements[i];
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

// Evaluates the Block Statement AST
export function evaluateBlockStatement(
  blockStatement: BlockStatement,
  environment: Environment
): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNullValue();

  const scope = new Environment(environment);

  for (const statement of blockStatement.statements) {
    lastEvaluated = evaluate(statement, scope);
  }

  return lastEvaluated;
}

// Evaluates the Try-Catch Statement AST
export function evaluateTryCatchStatement(
  tryCatchStatement: TryCatchStatement,
  environment: Environment
): RuntimeValue {
  try {
    return evaluateBlockStatement(tryCatchStatement.tryBlock, environment);
  } catch (error) {
    // Add the error to the catch block scope
    const scope = new Environment(environment);
    // Check if the error symbol is declared
    if (tryCatchStatement.errorSymbol) {
      if (error instanceof CrustError) {
        scope.declareVariable(
          tryCatchStatement.errorSymbol,
          makeErrorValue(error.type, error),
          true
        );
      } else if (error instanceof Error) {
        scope.declareVariable(
          tryCatchStatement.errorSymbol,
          makeErrorValue("RuntimeError", error),
          true
        );
      } else {
        scope.declareVariable(
          tryCatchStatement.errorSymbol,
          makeErrorValue("RuntimeError", new Error("Unknown error")),
          true
        );
      }
    }

    return evaluateBlockStatement(tryCatchStatement.catchBlock, scope);
  }
}
