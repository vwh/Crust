// index.ts | The entry point of our REPL

import Parser from "./front-end/parser";
import { evaluate } from "./runtime/interpreter";
import { log } from "./utils";

function repl() {
  const parser = new Parser();

  console.log("Crust REPL");

  while (true) {
    const input = prompt("Crust> ");

    if (input === "exit" || !input) {
      break;
    }

    // Produce AST from the source code
    const program = parser.produceAst(input);
    // log(program);

    const result = evaluate(program);
    log(result);
  }
}

repl();
