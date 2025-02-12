// tests/index.ts | The entry point of our tests

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

  const result2 = execute("'Hello World'") as StringValue;
  expect(result2.value).toBe("Hello World");
});

test("Null Literal", () => {
  const result = execute("null") as NullValue;
  expect(result.value).toBe(null);
});

test("Boolean Literal", () => {
  const result = execute("true") as BooleanValue;
  expect(result.value).toBe(true);

  const result2 = execute("false") as BooleanValue;
  expect(result2.value).toBe(false);
});

test("Numeric Literal", () => {
  const result = execute("100") as NumberValue;
  expect(result.value).toBe(100);

  const result2 = execute("100.5") as NumberValue;
  expect(result2.value).toBe(100.5);
});

test("Math Binary Expression", () => {
  const result = execute("(100 / 2) + 100 * 2 + (2 + 4)") as NumberValue;
  expect(result.value).toBe(256);

  const result2 = execute("2 ** 3") as NumberValue;
  expect(result2.value).toBe(8);

  const result3 = execute("4 // 3") as NumberValue;
  expect(result3.value).toBe(1);
});

test("Unary Expression", () => {
  const result = execute("-100") as NumberValue;
  expect(result.value).toBe(-100);

  const result2 = execute("!true") as BooleanValue;
  expect(result2.value).toBe(false);

  const result3 = execute("!''") as BooleanValue;
  expect(result3.value).toBe(false);

  const result4 = execute("!0") as BooleanValue;
  expect(result4.value).toBe(false);

  const result5 = execute("-52") as NumberValue;
  expect(result5.value).toBe(-52);
});

test("Strings Concatenation", () => {
  const result = execute('"Hello " + "World" + ("!" * 3) ') as StringValue;
  expect(result.value).toBe("Hello World!!!");
});

test("Numerics Comparison", () => {
  const result = execute("100 > 50") as BooleanValue;
  expect(result.value).toBe(true);

  const result2 = execute("100 < 50") as BooleanValue;
  expect(result2.value).toBe(false);

  const result3 = execute("100 <= 100") as BooleanValue;
  expect(result3.value).toBe(true);

  const result4 = execute("100 >= 50") as BooleanValue;
  expect(result4.value).toBe(true);

  const result5 = execute("100 == 50") as BooleanValue;
  expect(result5.value).toBe(false);
});

test("Strings Comparison", () => {
  const result = execute('"Hello World" > "Hello"') as BooleanValue;
  expect(result.value).toBe(true);

  const result2 = execute('"Hello World" < "Hello"') as BooleanValue;
  expect(result2.value).toBe(false);

  const result3 = execute('"Hello World" <= "Hello"') as BooleanValue;
  expect(result3.value).toBe(false);

  const result4 = execute('"Hello World" >= "Hello"') as BooleanValue;
  expect(result4.value).toBe(true);

  const result5 = execute('"Hello World" == "Hello"') as BooleanValue;
  expect(result5.value).toBe(false);
});

test("Variable Declaration & Identifier", () => {
  const result = execute("set x = 100; x") as NumberValue;
  expect(result.value).toBe(100);

  const result2 = execute("keep x = 100; x") as NumberValue;
  expect(result2.value).toBe(100);
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

test("Array Literal & Member Expression", () => {
  const result = execute(
    "set arr = [100, 32, 100 / 2, false, { bar: true }]; arr[3]"
  ) as BooleanValue;
  expect(result.value).toBe(false);
});

test("Call Expression", () => {
  const result = execute("fn returnFive() { 5 } returnFive()") as NumberValue;
  expect(result.value).toBe(5);

  const result2 = execute("fn returnX(x) { x } returnX(6)") as NumberValue;
  expect(result2.value).toBe(6);
});

test("Function Declaration", () => {
  const result = execute(
    "fn add(x, y) { set z = x + y; z } add(100, 100)"
  ) as NumberValue;

  const result2 = execute("fn add() { 5 } add()") as NumberValue;
  expect(result2.value).toBe(5);

  const result3 = execute(
    "fn testReturn(x) { if x == 0 { return x } 5 } testReturn(5)"
  ) as NumberValue;
  expect(result3.value).toBe(5);

  const result4 = execute(
    "fn testReturn(x) { if x == 0 { return x } return 5 } testReturn(0)"
  ) as NumberValue;
  expect(result4.value).toBe(0);
});

test("Global Objects", () => {
  const result = execute("Math.pow(2, 5)") as NumberValue;
  expect(result.value).toBe(32);

  const result2 = execute('Date.parse("2023-01-01")') as NumberValue;
  expect(result2.value).toBeGreaterThan(0);

  const result3 = execute("Int('100a')") as NumberValue;
  expect(result3.value).toBe(100);

  const result4 = execute("Float('100.5a')") as NumberValue;
  expect(result4.value).toBe(100.5);
});

test("If Statement", () => {
  const result = execute(
    "set x = 0; if true { x = x + 100 } elif false { x = x + 200 } else { x = x + 300 } x"
  ) as NumberValue;
  expect(result.value).toBe(100);

  const result2 = execute(
    "set x = 0; if false { x = x + 100 } elif true { x = x + 200 } else { x = x + 300 } x"
  ) as NumberValue;
  expect(result2.value).toBe(200);

  const result3 = execute(
    "set x = 0; if false { x = x + 100 } elif false { x = x + 200 } else { x = x + 300 } x"
  ) as NumberValue;
  expect(result3.value).toBe(300);
});

test("Logical Expression", () => {
  const result = execute("true && false") as BooleanValue;
  expect(result.value).toBe(false);

  const result2 = execute("true || false") as BooleanValue;
  expect(result2.value).toBe(true);

  const result3 = execute("false || false") as BooleanValue;
  expect(result3.value).toBe(false);
});

test("While Loop Statement & Break & Continue", () => {
  const result = execute(
    "set x = 0 set y = null while x <= 5 { x = x + 1 if x == 2 { y = 5 continue } elif x == 4 { break } } x - y"
  ) as NumberValue;
  expect(result.value).toBe(-1);
});

test("For Loop Statement", () => {
  const result = execute(
    "set x = 0 set y = null for x in range(1, 5) { x = x + 1 if x == 2 { y = 5 continue } elif x == 4 { break } } x - y"
  ) as NumberValue;
  expect(result.value).toBe(-5);
});

test("Block Statement", () => {
  const result = execute("set x = 0; { set x = 5 } x") as NumberValue;
  expect(result.value).toBe(0);
});

test("Try-Catch Statement", () => {
  const result = execute(
    "set x = 0 try { Int('a') } catch { x = 10 } x"
  ) as NumberValue;
  expect(result.value).toBe(10);

  const result2 = execute(
    "set x = 0 try { x = 5 } catch { x = 10 } x"
  ) as NumberValue;
  expect(result2.value).toBe(5);

  const result3 = execute(
    "set s = '' try { Int('a') } catch (e) { s = typeof(e) } s"
  ) as StringValue;
  expect(result3.value).toBe("error");
});
