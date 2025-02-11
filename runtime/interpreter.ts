// interpreter.ts | Responsible for evaluating the AST

import {
  evaluateFunctionDeclaration,
  evaluateProgram,
  evaluateVariableDeclaration,
  evaluateIfStatement,
  evaluateWhileStatement,
  evaluateBlockStatement,
} from "./evaluate/statments";
import {
  evaluateAssignmentExpression,
  evaluateBinaryExpression,
  evaluateIdentifier,
  evaluateMemberExpression,
  evaluateNativeFunction,
  evaluateObjectLiteral,
  evaluateUnaryExpression,
} from "./evaluate/expressions";
import { makeNumberValue, makeStringValue } from "./values";
import { log, throwAnError } from "../utils/errors";

import type {
  Statement,
  NumericLiteral,
  BinaryExpression,
  Program,
  Identifier,
  VariableDeclaration,
  AssignmentExpression,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
  FunctionDeclaration,
  StringLiteral,
  IfStatement,
  UnaryExpression,
  WhileStatement,
  BlockStatement,
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
    case "FunctionDeclaration":
      return evaluateFunctionDeclaration(
        ast as FunctionDeclaration,
        environment
      );
    case "IfStatement":
      return evaluateIfStatement(ast as IfStatement, environment);
    case "WhileStatement":
      return evaluateWhileStatement(ast as WhileStatement, environment);
    case "BreakStatement":
      throw Error("break");
    case "ContinueStatement":
      throw Error("continue");
    case "BlockStatement":
      return evaluateBlockStatement(ast as BlockStatement, environment);

    // Expressions
    case "AssignmentExpression":
      return evaluateAssignmentExpression(
        ast as AssignmentExpression,
        environment
      );
    case "ObjectLiteral":
      return evaluateObjectLiteral(ast as ObjectLiteral, environment);
    case "NumericLiteral":
      return makeNumberValue((ast as NumericLiteral).value);
    case "StringLiteral":
      return makeStringValue((ast as StringLiteral).value);
    case "BinaryExpression":
      return evaluateBinaryExpression(ast as BinaryExpression, environment);
    case "UnaryExpression":
      return evaluateUnaryExpression(ast as UnaryExpression, environment);
    case "Identifier":
      return evaluateIdentifier(ast as Identifier, environment);
    case "MemberExpression":
      return evaluateMemberExpression(ast as MemberExpression, environment);
    case "CallExpression":
      return evaluateNativeFunction(ast as CallExpression, environment);

    // Unhandled AST node
    default: {
      log(ast);
      return throwAnError(
        "RuntimeError",
        "at the ast the following ast: \n This AST node is not supported yet"
      );
    }
  }
}
