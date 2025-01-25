// index.ts | The entry point of our REPL

import {
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
} from "./runtime/values";
import Parser from "./front-end/parser";
import Environment from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { log } from "./utils";

function repl() {
  const parser = new Parser();

  // Global environment
  const environment = new Environment();
  // Global variables
  environment.declareVariable("test", makeNumberValue(100), true);
  environment.declareVariable("true", makeBooleanValue(true), true);
  environment.declareVariable("false", makeBooleanValue(false), true);
  environment.declareVariable("null", makeNullValue(), true);

  console.log("Crust REPL");

  while (true) {
    const input = prompt("Crust> ");

    if (input === "exit" || !input) {
      break;
    }

    // Produce AST from the source code
    const program = parser.produceAst(input);
    // log(program);

    // Evaluate the AST
    const result = evaluate(program, environment);
    log(result);
  }
}

repl();
