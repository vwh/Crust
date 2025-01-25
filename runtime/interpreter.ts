// interpreter.ts | Responsible for evaluating the AST

import {
  evaluateProgram,
  evaluateVariableDeclaration,
} from "./evaluate/statments";
import {
  evaluateBinaryExpression,
  evaluateIdentifier,
} from "./evaluate/expressions";
import { makeNumberValue } from "./values";
import { throwAnError } from "../utils";

import type {
  Statement,
  NumericLiteral,
  BinaryExpression,
  Program,
  Identifier,
  VariableDeclaration,
} from "../front-end/ast";
import type { RuntimeValue } from "./values";
import type Environment from "./environment";

// Evaluates the AST
export function evaluate(
  ast: Statement,
  environment: Environment
): RuntimeValue {
  switch (ast.kind) {
    // Statements
    case "Program":
      return evaluateProgram(ast as Program, environment);
    case "VariableDeclaration":
      return evaluateVariableDeclaration(
        ast as VariableDeclaration,
        environment
      );

    // Expressions
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
