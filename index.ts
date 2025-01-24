// index.ts | The entry point of our REPL

import Parser from "./front-end/parser";
import Environment from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import {
  makeBooleanValue,
  makeNullValue,
  makeNumberValue,
} from "./runtime/values";
import { log } from "./utils";

function repl() {
  const parser = new Parser();

  const environment = new Environment();
  environment.declareVariable("x", makeNumberValue(100));
  environment.declareVariable("true", makeBooleanValue(true));
  environment.declareVariable("false", makeBooleanValue(false));
  environment.declareVariable("null", makeNullValue());

  console.log("Crust REPL");

  while (true) {
    const input = prompt("Crust> ");

    if (input === "exit" || !input) {
      break;
    }

    // Produce AST from the source code
    const program = parser.produceAst(input);
    // log(program);

    const result = evaluate(program, environment);
    log(result);
  }
}

repl();
