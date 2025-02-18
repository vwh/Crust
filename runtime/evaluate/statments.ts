// statments.ts | Evaluates the statements in the runtime

import { evaluate } from "../interpreter";
import {
  makeArrayValue,
  makeErrorValue,
  makeNullValue,
  makeNumberValue,
  makeReturnValue,
  makeStringValue,
} from "../values";

import type {
  FunctionDeclaration,
  Program,
  VariableDeclaration,
  IfStatement,
  WhileStatement,
  BlockStatement,
  TryCatchStatement,
  ReturnStatement,
  ForStatement,
} from "../../front-end/ast";
import Environment from "../environment";
import type {
  ArrayValue,
  BooleanValue,
  FunctionValue,
  ObjectValue,
  RuntimeValue,
  StringValue,
} from "../values";
import { CrustError, Signal, throwAnError } from "../../utils/errors";

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
    const scopeEnv = new Environment(environment);

    let i = 0;
    while (i < whileStatement.body.statements.length) {
      const statement = whileStatement.body.statements[i];
      try {
        lastEvaluated = evaluate(statement, scopeEnv);
      } catch (error) {
        // Break/Continue signals
        if (error instanceof Signal) {
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

export function evaluateForStatement(
  forStatement: ForStatement,
  environment: Environment
): RuntimeValue {
  let lastEvaluated: RuntimeValue = makeNullValue();
  const collection = evaluate(forStatement.collection, environment);

  let collectionObj: ArrayValue;

  if (collection.type === "array") {
    collectionObj = collection as ArrayValue;
  } else if (collection.type === "string") {
    const array: RuntimeValue[] = [];
    for (let i = 0; i < (collection as StringValue).value.length; i++) {
      array.push(makeStringValue((collection as StringValue).value[i]));
    }
    collectionObj = makeArrayValue(array);
  } else if (collection.type === "object") {
    const array: RuntimeValue[] = [];
    for (const [key, value] of (collection as ObjectValue).properties) {
      array.push(makeStringValue(key));
    }
    collectionObj = makeArrayValue(array);
  } else {
    throwAnError(
      "RuntimeError",
      `The collection of the for loop must be an array or a string but got [ ${collection.type} ]`
    );
  }

  const loopEnv = new Environment(environment);
  loopEnv.declareVariable(forStatement.variable, makeNullValue(), false);

  for (let i = 0; i < collectionObj.elements.length; i++) {
    // Update the loop variable with the current element
    loopEnv.assignVariable(forStatement.variable, collectionObj.elements[i]);

    try {
      lastEvaluated = evaluateBlockStatement(forStatement.body, loopEnv);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "break") {
          break;
        }
        if (error.message === "continue") {
          continue;
        }
        throw error;
      }
    }
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

    // If the last evaluated value is a return value, return it
    if (lastEvaluated?.type === "return") {
      return lastEvaluated;
    }
  }

  return lastEvaluated;
}

// Evaluates the Return Statement AST
export function evaluateReturnStatement(
  returnStatement: ReturnStatement,
  environment: Environment
): RuntimeValue {
  const value = returnStatement.value
    ? evaluate(returnStatement.value, environment)
    : makeNullValue();

  return makeReturnValue(value);
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
