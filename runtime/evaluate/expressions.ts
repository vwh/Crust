// expressions.ts | Evaluates the expressions in the runtime

import { evaluate } from "../interpreter";
import Environment from "../environment";
import {
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
  makeStringValue,
} from "../values";
import { throwAnError } from "../../utils/errors";

import type {
  AssignmentExpression,
  BinaryExpression,
  Identifier,
  ObjectLiteral,
  CallExpression,
  MemberExpression,
  UnaryExpression,
} from "../../front-end/ast";
import type {
  BooleanValue,
  ErrorValue,
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
  const value = evaluate(node.value, environment);

  if (node.assignment.kind === "Identifier") {
    const identifier = node.assignment as Identifier;
    environment.assignVariable(identifier.symbol, value);

    return value;
  }

  if (node.assignment.kind === "MemberExpression") {
    const member = node.assignment as MemberExpression;
    const object = evaluate(member.object, environment) as ObjectValue;
    const property = member.property as Identifier;
    const computed = member.computed;

    if (computed) {
      const propertyValue = evaluate(
        member.property,
        environment
      ) as StringValue;
      if (propertyValue.type !== "string") {
        throwAnError(
          "RuntimeError",
          `You can only access object properties using strings but got [ ${propertyValue.type} ]`
        );
      }

      object.properties.set(propertyValue.value, value);
      return value;
    }

    if (property.kind !== "Identifier") {
      throwAnError(
        "RuntimeError",
        `Member Assignment expression must be an identifier but got [ ${property.kind} ]`
      );
    }

    object.properties.set(property.symbol, value);

    return value;
  }

  throwAnError(
    "RuntimeError",
    `Assignment expression is not supported for member expressions with property [ ${node.assignment.kind} ]`
  );
}

// Evaluates the UnaryExpression AST
export function evaluateUnaryExpression(
  node: UnaryExpression,
  environment: Environment
): RuntimeValue {
  const value = evaluate(node.argument, environment);

  if (value.type === "boolean") {
    if (node.operator === "!") {
      return makeBooleanValue(!(value as BooleanValue).value);
    }

    throwAnError(
      "RuntimeError",
      `The operator [ ${node.operator} ] is not supported for unary expressions with booleans`
    );
  }

  if (value.type === "string") {
    if (node.operator === "!") {
      return makeBooleanValue(!((value as StringValue).value.length === 0));
    }

    throwAnError(
      "RuntimeError",
      `The operator [ ${node.operator} ] is not supported for unary expressions with strings`
    );
  }

  if (value.type === "number") {
    if (node.operator === "!") {
      return makeBooleanValue(!((value as NumberValue).value === 0));
    }

    if (node.operator === "-") {
      return makeNumberValue(-(value as NumberValue).value);
    }

    if (node.operator === "+") {
      return makeNumberValue(Math.abs((value as NumberValue).value));
    }

    throwAnError(
      "RuntimeError",
      `The operator [ ${node.operator} ] is not supported for unary expressions with numbers`
    );
  }

  throwAnError(
    "RuntimeError",
    `The operator [ ${node.operator} ] is not supported for unary expressions`
  );
}

// Evaluates the BinaryExpression AST
export function evaluateBinaryExpression(
  BinaryExpression: BinaryExpression,
  environment: Environment
): RuntimeValue {
  const left = evaluate(BinaryExpression.left, environment);
  const right = evaluate(BinaryExpression.right, environment);

  // If left hand side is a number and right hand side is a number
  if (left.type === "number" && right.type === "number") {
    return evaluateNumericBinaryExpression(
      left as NumberValue,
      right as NumberValue,
      BinaryExpression.operator
    );
  }

  // If left hand side is a string and right hand side is a string
  if (left.type === "string" && right.type === "string") {
    return evaluateStringBinaryExpression(
      left as StringValue,
      right as StringValue,
      BinaryExpression.operator
    );
  }

  // If left hand side is boolean and right hand side is boolean
  if (left.type === "boolean" && right.type === "boolean") {
    return evaluateBooleanBinaryExpression(
      left as BooleanValue,
      right as BooleanValue,
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

  if (left.type === "error" || right.type === "string") {
    return evaluateErrorAndStringBinaryExpression(
      left as ErrorValue,
      right as StringValue,
      BinaryExpression.operator
    );
  }

  // If both sides are not numbers or one of them
  return makeNullValue();
}

export function evaluateErrorAndStringBinaryExpression(
  left: ErrorValue,
  right: StringValue,
  operator: string
): RuntimeValue {
  let resultB = false;

  if (operator === "==") {
    resultB = left.value === right.value;
  } else if (operator === "!=") {
    resultB = left.value !== right.value;
  } else {
    throwAnError(
      "RuntimeError",
      `The operator [ ${operator} ] is not supported for error and string binary expressions`
    );
  }

  return makeBooleanValue(resultB);
}

export function evaluateBooleanBinaryExpression(
  left: BooleanValue,
  right: BooleanValue,
  operator: string
): RuntimeValue {
  let resultB = false;

  if (operator === "==") {
    resultB = left.value === right.value;
  } else if (operator === "!=") {
    resultB = left.value !== right.value;
  } else if (operator === "&&") {
    resultB = left.value && right.value;
  } else if (operator === "||") {
    resultB = left.value || right.value;
  } else {
    throwAnError(
      "RuntimeError",
      `The operator [ ${operator} ] is not supported for boolean and boolean binary expressions`
    );
  }

  return makeBooleanValue(resultB);
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

  throwAnError(
    "RuntimeError",
    `The operator [ ${operator} ] is not supported for string and number binary expressions`
  );
}

// Evaluates the String Binary Expression
export function evaluateStringBinaryExpression(
  left: StringValue,
  right: StringValue,
  operator: string
): RuntimeValue {
  let resultS = "";
  let resultB = false;
  let isComparison = false;

  if (operator === "+") {
    resultS = left.value + right.value;
  } else if (operator === "==") {
    isComparison = true;
    resultB = left.value === right.value;
  } else if (operator === "!=") {
    isComparison = true;
    resultB = left.value !== right.value;
  } else if (operator === "<") {
    isComparison = true;
    resultB = left.value < right.value;
  } else if (operator === ">") {
    isComparison = true;
    resultB = left.value > right.value;
  } else if (operator === "<=") {
    isComparison = true;
    resultB = left.value <= right.value;
  } else if (operator === ">=") {
    isComparison = true;
    resultB = left.value >= right.value;
  } else {
    throwAnError(
      "RuntimeError",
      `The operator [ ${operator} ] is not supported for string and string binary expressions`
    );
  }

  return isComparison ? makeBooleanValue(resultB) : makeStringValue(resultS);
}

// Evaluates the Numeric Binary Expression
export function evaluateNumericBinaryExpression(
  left: NumberValue,
  right: NumberValue,
  operator: string
): RuntimeValue {
  let resultN = 0;
  let resultB = false;
  let isComparison = false;

  if (operator === "+") {
    resultN = left.value + right.value;
  } else if (operator === "-") {
    resultN = left.value - right.value;
  } else if (operator === "*") {
    resultN = left.value * right.value;
  } else if (operator === "/") {
    // TODO: Handle division by zero
    resultN = left.value / right.value;
  } else if (operator === "%") {
    resultN = left.value % right.value;
  } else if (operator === "**") {
    resultN = left.value ** right.value;
  } else if (operator === "//") {
    resultN = Math.floor(left.value / right.value);
  } else if (operator === "==") {
    isComparison = true;
    resultB = left.value === right.value;
  } else if (operator === "!=") {
    isComparison = true;
    resultB = left.value !== right.value;
  } else if (operator === "<") {
    isComparison = true;
    resultB = left.value < right.value;
  } else if (operator === ">") {
    isComparison = true;
    resultB = left.value > right.value;
  } else if (operator === "<=") {
    isComparison = true;
    resultB = left.value <= right.value;
  } else if (operator === ">=") {
    isComparison = true;
    resultB = left.value >= right.value;
  } else {
    throwAnError(
      "RuntimeError",
      `The operator [ ${operator} ] is not supported for number and number binary expressions`
    );
  }

  return isComparison ? makeBooleanValue(resultB) : makeNumberValue(resultN);
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
  const isComputed = node.computed;

  if (object.type !== "object") {
    throwAnError(
      "RuntimeError",
      `The member expression is not supported for [ ${object.type} ]`
    );
  }

  if (isComputed) {
    const property = evaluate(node.property, environment) as StringValue;

    if (property.type !== "string") {
      throwAnError(
        "RuntimeError",
        "You can only access object properties using strings but got [ ${property.type} ]"
      );
    }

    return object.properties.get(property.value) as RuntimeValue;
  }

  if (node.property.kind !== "Identifier") {
    throwAnError(
      "RuntimeError",
      `Member expression must be an identifier but got [ ${node.property.kind} ]`
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
    // It will be evaluated in the runtime
    const result = (fn as NativeFunctionValue).call(args, environment);

    return result;
  }

  // User-defined functions
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

  throwAnError(
    "RuntimeError",
    `Call expression is not supported for [ ${fn.type} ]`
  );
}
