import Parser from "./front-end/parser";

import { log } from "./utils";

function repl() {
  const parser = new Parser();

  console.log("Crust REPL");

  while (true) {
    const input = prompt("Crust> ");

    if (input === "exit" || !input) {
      break;
    }

    const program = parser.produceAst(input);
    log(program);
  }
}

repl();
