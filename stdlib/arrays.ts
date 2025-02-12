// stdlib/arrays.ts | Standard library for arrays

import {
  makeNativeFunctionValue,
  makeNullValue,
  makeArrayValue,
  makeNumberValue,
  makeStringValue,
} from "../runtime/values";
import { throwAnError } from "../utils/errors";

import type {
  ArrayValue,
  NumberValue,
  RuntimeValue,
  StringValue,
} from "../runtime/values";
import strings from "./strings";

// Array methods
const array = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeArrayValue([]);

  const array = makeArrayValue([]);
  for (let i = 0; i < args.length; i++) {
    array.elements.push(args[i]);
  }

  return array;
});

const append = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;
  for (let i = 1; i < args.length; i++) {
    array.elements.push(args[i]);
  }

  return makeNullValue();
});

const remove = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;
  const index = (
    args[1]?.type === "number" ? args[1] : makeNumberValue(0)
  ) as NumberValue;
  if (index.type !== "number")
    throwAnError("TypeError", `Expected a number, got ${index.type}`);

  if (index.value < 0)
    throwAnError("IndexOutOfBoundsError", "Index out of bounds");
  if (index.value >= array.elements.length)
    throwAnError("IndexOutOfBoundsError", "Index out of bounds");

  array.elements.splice(index.value, 1);

  return makeNullValue();
});

const pop = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;

  if (array.elements.length === 0)
    throwAnError("IndexOutOfBoundsError", "Array is empty");

  const last = array.elements.pop() as RuntimeValue;
  return last;
});

const push = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;
  for (let i = 1; i < args.length; i++) {
    array.elements.push(args[i]);
  }

  return makeNullValue();
});

const shift = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;

  if (array.elements.length === 0)
    throwAnError("IndexOutOfBoundsError", "Array is empty");

  const first = array.elements.shift() as RuntimeValue;
  return first;
});

const unshift = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;
  for (let i = args.length - 1; i >= 0; i--) {
    array.elements.unshift(args[i]);
  }

  return makeNullValue();
});

const reverse = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();
  const arg = args[0];

  if (arg.type !== "array")
    throwAnError("TypeError", `Expected an array, got ${arg.type}`);

  const array = arg as ArrayValue;

  array.elements.reverse();

  return makeNullValue();
});

const range = makeNativeFunctionValue((args) => {
  if (args.length === 0) return makeNullValue();

  // implement range python-like range(start, end, step)
  const start = args[0] as NumberValue;
  if (start.type !== "number")
    throwAnError("TypeError", `Expected a number, got ${start.type}`);

  const end = args[1] as NumberValue;
  if (end.type !== "number")
    throwAnError("TypeError", `Expected a number, got ${end.type}`);

  const step = (args[2] ?? makeNumberValue(1)) as NumberValue;
  if (step.type !== "number")
    throwAnError("TypeError", `Expected a number, got ${step.type}`);

  const array = makeArrayValue([]);
  for (let i = start.value; i < end.value; i += step.value) {
    array.elements.push(makeNumberValue(i));
  }

  return array;
});

export default {
  Array: array,
  append,
  remove,
  pop,
  push,
  shift,
  unshift,
  reverse,
  range,
};
