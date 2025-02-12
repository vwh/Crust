// index.ts | The entry point of our REPL

import Parser from "./front-end/parser";
import Environment from "./runtime/environment";
import { evaluate } from "./runtime/interpreter";
import { log } from "./utils/errors";
import fs from "node:fs";
import { readCrustFilesFromStdlib } from "./utils/stdlib";

// Read all crust files from the stdlib folder
const crustSTDLIB = await readCrustFilesFromStdlib();
function combineStdlib(input: string) {
  return `${crustSTDLIB}\n${input}`;
}

function repl() {
  const parser = new Parser();

  // Global environment
  const environment = new Environment();

  console.log("Crust REPL");

  while (true) {
    const input = combineStdlib(prompt("Crust> ") || "");

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

function run(fileName: string) {
  const parser = new Parser();

  // Global environment
  const environment = new Environment();

  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      throw err;
    }

    const input = combineStdlib(data.toString());

    // Produce AST from the source code
    const program = parser.produceAst(input);

    // Evaluate the AST
    const result = evaluate(program, environment);
    log(result);
  });
}

const args = process.argv.slice(2);
if (args.length === 0) {
  repl();
} else {
  run(args[0]);
}
