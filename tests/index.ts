import { expect, test } from "bun:test";

import Parser from "../front-end/parser";
import { evaluate } from "../runtime/interpreter";
import Environment from "../runtime/environment";

import type { BooleanValue, NumberValue } from "../runtime/values";

function execute(code: string) {
  const parser = new Parser();
  const environment = new Environment();

  // Produce AST from the source code
  const program = parser.produceAst(code);

  // Evaluate the AST
  const result = evaluate(program, environment);
  return result;
}

test("Binary Expression", () => {
  const result = execute("(100 / 2) + 100 * 2 + (2 + 4)") as NumberValue;
  expect(result.value).toBe(256);
});

test("Math Operators", () => {
  const result = execute("100 + 100 * 100 / 100 - 100 % 100") as NumberValue;
  expect(result.value).toBe(200);
});

test("Variable Declaration & Identifier", () => {
  const result = execute("let x = 100; x") as NumberValue;
  expect(result.value).toBe(100);
});

test("Assignment Expression", () => {
  const result = execute("let x = 100; x = x + 100") as NumberValue;
  expect(result.value).toBe(200);
});

test("Object Literal & Member Expression", () => {
  const result = execute(
    "let obj = { x: 100, y: 32, foo: 100 / 2, test: false, complex: { bar: true } }; obj.complex.bar"
  ) as BooleanValue;
  expect(result.value).toBe(true);
});

test("Call Expression", () => {
  const result = execute("let x = get(100 / 2); x") as NumberValue;
  expect(result.value).toBe(50);
});
