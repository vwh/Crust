import Parser from "./front-end/parser";

function repl() {
  const parser = new Parser();

  console.log("Crust REPL");

  while (true) {
    const input = prompt("Crust> ");

    if (input === "exit" || !input) {
      break;
    }

    const program = parser.produceAst(input);
    console.log(JSON.stringify(program, null, 2)); // TODO: MAKE OUTPUT BETTER
  }
}

repl();
