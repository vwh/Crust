// expressions.ts | Evaluates the expressions in the runtime

import { evaluate } from "../interpreter";
import Environment from "../environment";
import { makeNullValue, makeNumberValue, makeStringValue } from "../values";
import { throwAnError } from "../../utils/errors";

import type {
  AssignmentExpression,
  BinaryExpression,
  Identifier,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
} from "../../front-end/ast";
import type {
  FunctionValue,
  NativeFunctionValue,
  NumberValue,
  ObjectValue,
  RuntimeValue,
  StringValue,
} from "../values";

// Evaluates the AssignmentExpression AST
export function evaluateAssignmentExpression(
  node: AssignmentExpression,
  environment: Environment
): RuntimeValue {
  if (node.assignment.kind !== "Identifier") {
    return throwAnError(
      "RuntimeError",
      `at the assignment expression [ ${node.assignment} ]: \n Assignment expression is not supported`
    );
  }

  const value = evaluate(node.value, environment);
  const identifier = node.assignment as Identifier;

  environment.assignVariable(identifier.symbol, value);

  return value;
}
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

  // if left hand side is a string and right hand side is a string
  if (left.type === "string" && right.type === "string") {
    return evaluateStringBinaryExpression(
      left as StringValue,
      right as StringValue,
      BinaryExpression.operator
    );
  }

  if (left.type === "string" || right.type === "number") {
    return evaluateStringAndNumberBinaryExpression(
      left as StringValue,
      right as NumberValue,
      BinaryExpression.operator
    );
  }

  // if both sides are not numbers or one of them
  return makeNullValue();
}

// Evaluates the String and Number Binary Expression
export function evaluateStringAndNumberBinaryExpression(
  left: StringValue,
  right: NumberValue,
  operator: string
): RuntimeValue {
  if (operator === "*") {
    return makeStringValue(left.value.repeat(right.value));
  }

  return throwAnError(
    "RuntimeError",
    `at the operator [ ${operator} ]: \n Operator is not supported in strings`
  );
}

// Evaluates the String Binary Expression
export function evaluateStringBinaryExpression(
  left: StringValue,
  right: StringValue,
  operator: string
): RuntimeValue {
  if (operator === "+") {
    return makeStringValue(left.value + right.value);
  }

  return throwAnError(
    "RuntimeError",
    `at the operator [ ${operator} ]: \n Operator is not supported in strings`
  );
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
      `at the operator [ ${operator} ]: \n Operator is not supported in numbers`
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

// Evaluates the Object Literal AST
export function evaluateObjectLiteral(
  node: ObjectLiteral,
  environment: Environment
): RuntimeValue {
  const object = { type: "object", properties: new Map() } as ObjectValue;

  for (const { key, value } of node.properties) {
    const runtimeValue =
      value === undefined
        ? environment.getVariable(key)
        : evaluate(value, environment);

    object.properties.set(key, runtimeValue);
  }

  return object;
}

// Evaluates the Member Expression AST
export function evaluateMemberExpression(
  node: MemberExpression,
  environment: Environment
): RuntimeValue {
  const object = evaluate(node.object, environment) as ObjectValue;

  if (object.type !== "object") {
    return throwAnError(
      "RuntimeError",
      `at the member expression [ ${node.object} ]: \n Member expression is not supported`
    );
  }

  if (node.property.kind !== "Identifier") {
    return throwAnError(
      "RuntimeError",
      `at the member expression [ ${node.property} ]: \n Member expression is not supported`
    );
  }

  const property = node.property as Identifier;

  return object.properties.get(property.symbol) as RuntimeValue;
}

// Evaluates the Call Expression AST
export function evaluateNativeFunction(
  node: CallExpression,
  environment: Environment
): RuntimeValue {
  const args = node.arguments.map((arg) => evaluate(arg, environment));
  const fn = evaluate(node.caller, environment);

  if (fn.type === "native-function") {
    // it will be evaluated in the runtime
    const result = (fn as NativeFunctionValue).call(args, environment);

    return result;
  }

  // user-defined functions
  if (fn.type === "function") {
    const userfn = fn as FunctionValue;
    const scope = new Environment(userfn.environment);

    // Create the variables for the function parameters
    for (let i = 0; i < userfn.parameters.length; i++) {
      // TODO: check args/parameters bounds and throw an error if needed
      const varname = userfn.parameters[i];
      scope.declareVariable(varname, args[i], false);
    }

    let result: RuntimeValue = makeNullValue();
    for (const statement of userfn.body) {
      result = evaluate(statement, scope);
    }

    return result;
  }

  return throwAnError(
    "RuntimeError",
    `at the call expression [ ${node.caller} ]: \n Call expression is not supported`
  );
}
