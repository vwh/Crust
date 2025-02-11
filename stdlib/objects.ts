// stdlib/objects.ts | Standard library objects

import { javascriptValueToCrustValue } from "../utils/javascript";

// Converts a javascript Date object to a crust Date object
export const dateObject = javascriptValueToCrustValue({
  now: Date.now,
  parse: Date.parse,
  UTC: Date.UTC,
});

// Converts a javascript JSON object to a crust JSON object
export const jsonObject = javascriptValueToCrustValue({
  parse: JSON.parse,
  stringify: JSON.stringify,
});

// Converts a javascript Math object to a crust Math object
export const mathObject = javascriptValueToCrustValue({
  PI: Math.PI,
  E: Math.E,
  abs: Math.abs,
  acos: Math.acos,
  acosh: Math.acosh,
  asin: Math.asin,
  asinh: Math.asinh,
  atan: Math.atan,
  atanh: Math.atanh,
  atan2: Math.atan2,
  cbrt: Math.cbrt,
  ceil: Math.ceil,
  clz32: Math.clz32,
  cos: Math.cos,
  cosh: Math.cosh,
  exp: Math.exp,
  expm1: Math.expm1,
  floor: Math.floor,
  fround: Math.fround,
  hypot: Math.hypot,
  imul: Math.imul,
  log: Math.log,
  log1p: Math.log1p,
  log10: Math.log10,
  log2: Math.log2,
  max: Math.max,
  min: Math.min,
  pow: Math.pow,
  random: Math.random,
  round: Math.round,
  sign: Math.sign,
  sin: Math.sin,
  sinh: Math.sinh,
  sqrt: Math.sqrt,
  tan: Math.tan,
  tanh: Math.tanh,
  trunc: Math.trunc,
});

export default {
  date: dateObject,
  json: jsonObject,
  math: mathObject,
};
