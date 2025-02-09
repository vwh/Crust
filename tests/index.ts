import { expect, test } from "bun:test";

import Parser from "../front-end/parser";
import { evaluate } from "../runtime/interpreter";
import Environment from "../runtime/environment";

import type {
  BooleanValue,
  NullValue,
  NumberValue,
  StringValue,
} from "../runtime/values";

function execute(code: string) {
  const parser = new Parser();
  const environment = new Environment();

  // Produce AST from the source code
  const program = parser.produceAst(code);

  // Evaluate the AST
  const result = evaluate(program, environment);
  return result;
}

test("String Literal", () => {
  const result = execute('"Hello World"') as StringValue;
  expect(result.value).toBe("Hello World");
});

test("Null Literal", () => {
  const result = execute("null") as NullValue;
  expect(result.value).toBe(null);
});

test("Boolean Literal", () => {
  const result = execute("true") as BooleanValue;
  expect(result.value).toBe(true);
});

test("Numeric Literal", () => {
  const result = execute("100") as NumberValue;
  expect(result.value).toBe(100);
});

test("Binary Expression", () => {
  const result = execute("(100 / 2) + 100 * 2 + (2 + 4)") as NumberValue;
  expect(result.value).toBe(256);
});

test("Math Operators", () => {
  const result = execute("100 + 100 * 100 / 100 - 100 % 100") as NumberValue;
  expect(result.value).toBe(200);
});

test("Variable Declaration & Identifier", () => {
  const result = execute("set x = 100; x") as NumberValue;
  expect(result.value).toBe(100);
});

test("Assignment Expression", () => {
  const result = execute("set x = 100; x = x + 100") as NumberValue;
  expect(result.value).toBe(200);
});

test("Object Literal & Member Expression", () => {
  const result = execute(
    "set obj = { x: 100, y: 32, foo: 100 / 2, test: false, complex: { bar: true } }; obj.complex.bar"
  ) as BooleanValue;
  expect(result.value).toBe(true);
});

test("Call Expression", () => {
  const result = execute("set x = get(100 / 2); x") as NumberValue;
  expect(result.value).toBe(50);
});

test("Function Declaration", () => {
  const result = execute(
    "fn add(x, y) { set z = x + y; z } add(100, 100)"
  ) as NumberValue;
  expect(result.value).toBe(200);
});
